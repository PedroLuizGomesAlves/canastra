# Contador de Canastra (app instalável)

Esta pasta é o app completo. Para instalar no celular, ela precisa ficar num endereço https.

## Publicar de graça no GitHub Pages
1. Crie uma conta em github.com e um repositório novo (por exemplo `canastra`), público.
2. Envie todo o conteúdo desta pasta para o repositório (botão "Add file > Upload files").
   Envie os arquivos e as pastas `css`, `js`, `fonts` e `icons`, não a pasta `canastra-pwa` em si.
3. No repositório: Settings > Pages > Source: "Deploy from a branch" > branch `main` e pasta `/ (root)` > Save.
4. Em 1 ou 2 minutos o app fica em `https://SEU-USUARIO.github.io/canastra/`.

## Instalar no celular
1. Abra o endereço no Chrome do celular e deixe carregar uma vez, com internet.
2. Menu (três pontos) > "Instalar app" (ou "Adicionar à tela inicial").
3. Pronto: o app aparece na tela inicial e abre em tela cheia, mesmo em modo avião.

## Se você mudar algum arquivo
No `sw.js`, aumente o número em `VERSAO` (de `canastra-v1` para `canastra-v2`, e assim por diante).
Senão o celular continua mostrando a versão antiga guardada.
