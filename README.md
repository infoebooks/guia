# Info Ebooks — Guia RDC

Interface pública da página de vendas e da área do comprador. O conteúdo pago, as compras e os dados por conta ficam no Supabase; o e-book é entregue pela Hotmart.

## Publicação sem domínio próprio

Use uma hospedagem de sites estáticos com integração Git, por exemplo Cloudflare Pages. O serviço informa o endereço definitivo ao concluir a implantação.

- Repositório: infoebooks/guia
- Branch: main, após o envio autorizado dos arquivos
- Framework: None
- Build command: npm run build
- Build output directory: public
- Root directory: raiz do repositório

O pacote já contém os arquivos compilados. O build verifica sua estrutura, a ausência dos datasets pagos e padrões de credenciais secretas. A chave Supabase publishable é pública por definição e depende das políticas do banco para limitar acesso. Chaves administrativas e Hottok ficam somente no servidor.

## Caminhos

- / — página de vendas
- /vendas/ — alias da página de vendas
- /entrar/ — login, primeiro acesso e entrada no guia
- /cliente/ — redirecionamento de links antigos

## Antes de ativar a venda do guia

1. Obter o endereço HTTPS informado pela hospedagem.
2. Configurar esse endereço com /entrar/ como retorno autorizado no Supabase Auth e testar SMTP/confirmacão/recuperação.
3. Configurar HOTMART_HOTTOK no ambiente do webhook e ativar os eventos do produto guia.
4. Criar uma conta de aluno de teste para a validação da entrega externa na Hotmart.
5. Finalizar o produto guia, ativar a oferta adicional e validar uma compra e seu acesso de ponta a ponta.

O simples cadastro não concede acesso ao conteúdo pago. O servidor valida a compra vinculada ao e-mail confirmado e sua validade.

Não publique a versão integral de revisão, datasets ou o PDF pago no repositório público. Esta exportação inclui somente amostras de divulgação e o roteiro oficial público.

GitHub Pages não é o destino de hospedagem deste serviço comercial. Documentação: https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features#pages . Integração sugerida: https://developers.cloudflare.com/pages/get-started/git-integration/ .
