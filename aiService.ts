
import { GoogleGenAI } from "@google/genai";
import { FUNNEL_ELEMENTS } from './constants';
import { Node } from 'reactflow';

// --- FILTRO DE ELEMENTOS PARA A IA ---
// Removemos a categoria 'text' (Títulos e Notas) para forçar a IA 
// a usar apenas elementos funcionais e colocar o contexto na 'description'.
const AI_AVAILABLE_ELEMENTS = FUNNEL_ELEMENTS.filter(el => el.category !== 'text');

const SYSTEM_INSTRUCTION = `
Você é um Arquiteto de Funis de Marketing Sênior e Engenheiro de Software.

Sua tarefa é receber um "Estado Atual" de um quadro (nós) e um "Prompt do Usuário" e retornar O NOVO ESTADO COMPLETO (JSON).

### Elementos Disponíveis
Abaixo estão os ÚNICOS elementos que você pode usar.
LISTA DE ELEMENTOS:
${JSON.stringify(AI_AVAILABLE_ELEMENTS)}

### REGRAS ESTRITAS DE CONSTRUÇÃO (IMPORTANTE)
1. **PROIBIDO USAR TEXTOS SOLTOS:**
   - Você NÃO tem permissão para criar nós de título ou blocos de notas.
   - Todo o contexto, copy, scripts, perguntas ou explicações DEVEM ser inseridos no campo **\`data.description\`** do nó funcional relevante.
   - Exemplo: Ao invés de criar uma nota ao lado do checkout dizendo "Oferta com urgência", insira isso na descrição do nó 'page-checkout'.

### REGRAS VISUAIS DE LAYOUT
Você deve organizar os nós visualmente de forma limpa e lógica, seguindo estas regras para um visual "ENCAIXADO":

1. **JORNADA PRINCIPAL (HORIZONTAL - ESPINHA DORSAL):**
   - O fluxo principal (O caminho "Feliz" do cliente) DEVE ser horizontal (Eixo X).
   - Ex: Anúncio -> Página -> Checkout -> Compra -> Acesso.
   - Mantenha Y = 0 (ou constante) para esses itens.
   - Espaçamento X entre itens (Centro a Centro): **260 pixels**.

2. **AÇÕES DE SUPORTE E RAMIFICAÇÕES (VERTICAL):**
   - Itens que "suportam" a jornada principal (Emails, WhatsApp, Tags, Delays, Recuperação) devem ser ramificados VERTICALMENTE (Eixo Y).
   - Use Y negativo (Acima) ou Y positivo (Abaixo).
   - Espaçamento Y entre itens: **180 pixels**.

3. **LÓGICA DE FORMULÁRIOS (REGRA DE OURO):**
   - SEMPRE que você adicionar um 'action-form' (Formulário Nativo), você DEVE adicionar IMEDIATAMENTE DEPOIS um nó 'page-thankyou' (ou similar) com label "Tela Final Form".
   - O nó "Tela Final Form" deve estar conectado logo após o Formulário.

4. **EXTRAÇÃO DE CONTEXTO E DETALHES (OBRIGATÓRIO):**
   - O usuário pode fornecer prompts MUITO DETALHADOS contendo scripts, perguntas de formulário, gatilhos mentais ou copy.
   - Você DEVE extrair esses detalhes e colocá-los no campo **\`data.description\`** do nó correspondente.
   - **Formulários e Quizzes:** Sempre preencha o array \`items\` com perguntas exemplo se o usuário não especificar.

### Regras de Conexão (Edges)
- Crie conexões lógicas (source -> target).
- Type da aresta: 'floating'.

### Formato de Resposta
Responda APENAS com um JSON válido (sem markdown). Formato:
{
  "nodes": [
    { 
      "id": "string", 
      "type": "custom", 
      "position": { "x": number, "y": number }, 
      "data": { 
          "label": "string", 
          "type": "string", 
          "category": "string", 
          "iconName": "string", 
          "items": [], 
          "description": "AQUI VAI O CONTEXTO DETALHADO/COPY/SCRIPTS" 
      } 
    }
  ],
  "edges": [
    { "id": "string", "source": "string", "target": "string" }
  ]
}
`;

export const generateFunnelFromAI = async (prompt: string, currentNodes: Node[] = []) => {
  try {
    // Tenta pegar do LocalStorage (definido pelo usuário) ou Environment (definido no build)
    const apiKey = localStorage.getItem('funnelboard_api_key') || (typeof process !== 'undefined' ? process.env.API_KEY : undefined);

    if (!apiKey) {
        throw new Error("MISSING_API_KEY");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Prepara o contexto para a IA
    const currentStateJSON = JSON.stringify({
      nodes: currentNodes.map(n => ({ 
        id: n.id, 
        type: n.type, 
        position: n.position, 
        data: n.data 
      }))
    });

    const fullPrompt = `
    ESTADO ATUAL DO QUADRO (JSON):
    ${currentStateJSON}

    PEDIDO DO USUÁRIO (TEXTO RICO):
    ${prompt}
    
    LEMBRE-SE: 
    1. Layout Compacto: X gap ~260px, Y gap ~180px.
    2. Horizontal para jornada principal, Vertical para ações.
    3. PROIBIDO criar nós de Texto/Notas. Use o campo 'description'.
    4. PREENCHA O CAMPO 'description' DE CADA NÓ COM OS DETALHES DO PROMPT.
    
    Ação: Retorne o JSON completo atualizado.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.3, // Temperatura levemente reduzida para seguir melhor as restrições
      },
    });

    let jsonText = response.text || "";
    jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();

    if (!jsonText) throw new Error("Sem resposta da IA");

    const flowData = JSON.parse(jsonText);
    
    const nodes = flowData.nodes.map((n: any) => ({
      ...n,
      type: 'custom', 
    }));
    
    const edges = flowData.edges || [];

    return { nodes, edges };

  } catch (error) {
    console.error("Erro ao gerar quadro com IA:", error);
    throw error;
  }
};
