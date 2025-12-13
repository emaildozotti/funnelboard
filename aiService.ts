
import { GoogleGenAI } from "@google/genai";
import { FUNNEL_ELEMENTS } from './constants';
import { Node } from 'reactflow';

const SYSTEM_INSTRUCTION = `
Você é um Arquiteto de Funis de Marketing Sênior e Engenheiro de Software.

Sua tarefa é receber um "Estado Atual" de um quadro (nós) e um "Prompt do Usuário" e retornar O NOVO ESTADO COMPLETO (JSON).

### Elementos Disponíveis
LISTA DE ELEMENTOS:
${JSON.stringify(FUNNEL_ELEMENTS)}

### REGRAS VISUAIS DE LAYOUT (CRÍTICO)
Você deve organizar os nós visualmente de forma limpa e lógica, seguindo estas regras estritas para um visual "ENCAIXADO" e COMPACTO:

1. **JORNADA PRINCIPAL (HORIZONTAL - ESPINHA DORSAL):**
   - O fluxo principal (O caminho "Feliz" do cliente) DEVE ser horizontal (Eixo X).
   - Ex: Anúncio -> Página -> Checkout -> Compra -> Acesso.
   - Mantenha Y = 0 (ou constante) para esses itens.
   - Espaçamento X entre itens (Centro a Centro): **260 pixels**. (Não use espaçamentos muito largos).

2. **AÇÕES DE SUPORTE E RAMIFICAÇÕES (VERTICAL):**
   - Itens que "suportam" a jornada principal (Emails, WhatsApp, Tags, Delays, Recuperação) devem ser ramificados VERTICALMENTE (Eixo Y).
   - Use Y negativo (Acima) ou Y positivo (Abaixo).
   - Exemplo: Se há um Checkout em (X=1000, Y=0), o "Email de Recuperação" deve estar em (X=1000, Y=180).
   - Espaçamento Y entre itens: **180 pixels**.

3. **LÓGICA DE FORMULÁRIOS (REGRA DE OURO):**
   - SEMPRE que você adicionar um 'action-form' (Formulário Nativo), você DEVE adicionar IMEDIATAMENTE DEPOIS um nó 'page-thankyou' (ou similar) com label "Tela Final Form".
   - Isso é obrigatório para representar a ponte entre o anúncio e o próximo passo.
   - O nó "Tela Final Form" deve estar conectado logo após o Formulário.

4. **EXTRAÇÃO DE CONTEXTO E DETALHES (OBRIGATÓRIO):**
   - O usuário pode fornecer prompts MUITO DETALHADOS contendo scripts, perguntas de formulário, gatilhos mentais ou copy.
   - Você DEVE extrair esses detalhes e colocá-los no campo **\`data.description\`** do nó correspondente.
   - Exemplo: Se o prompt diz "No formulário pergunte sobre renda e urgência", o nó 'action-form' deve ter: "description": "Perguntas:\n1. Qual sua renda?\n2. Qual sua urgência?".
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
    // Inicializa a API dentro da função para evitar erros de inicialização no browser (tela branca)
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    3. Crie "Tela Final Form" após Formulários.
    4. PREENCHA O CAMPO 'description' DE CADA NÓ COM OS DETALHES DO PROMPT.
    
    Ação: Retorne o JSON completo atualizado.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.4, 
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
