# Roda da Sorte do Farivi

Site estático em HTML, CSS e JavaScript. Não precisa de backend nem de base de dados.

## Publicar com GitHub Pages

1. No repositório, abra **Settings → Pages**.
2. Em **Build and deployment**, escolha **Deploy from a branch**.
3. Selecione a branch `main` e a pasta `/(root)`, depois carregue em **Save**.
4. Aguarde alguns minutos e abra o endereço indicado nessa página. Normalmente será `https://zepedro9.github.io/roda-da-sorte-farivi/`.

## Criar o QR code

1. Depois de o site estar publicado, copie o URL apresentado nas definições de Pages.
2. Crie um QR code usando o Chrome (Partilhar → Código QR, se disponível) ou um gerador como https://www.qrcode-monkey.com/.
3. Cole o URL completo do GitHub Pages, descarregue o QR code e teste-o com outro telemóvel antes de imprimir.

## Alterar os prémios ou resultado

Os prémios estão configurados pela seguinte ordem: raspadinha de 5€, jantar num restaurante à escolha, carro, noite no Sheraton Hotel, iPhone 18 Pro Max e vale de 200€ para viagem.

Edite `script.js`:
- `prizes`: os seis textos que aparecem na roda.
- `selectedPrizeIndex`: índice do resultado final a partir de zero. O valor `5` corresponde a **Vale 200€ para viagem**.

O número de voltas e o tempo da animação variam, mas o resultado final está predefinido. Como o código é público, esta lógica pode ser consultada no repositório.
