# Política de segurança

## Escopo

Esta política se aplica aos códigos, automações, pipelines, infraestrutura como código, imagens, pacotes e documentos técnicos mantidos na organização Ouro Safra.

## Como reportar

Não publique vulnerabilidades ativas, credenciais, chaves, tokens ou dados sensíveis em Issues comuns.

Utilize o canal interno definido pela Segurança da Informação e inclua, quando possível: repositório e componente, ambiente afetado, descrição objetiva, impacto, evidências sem expor segredos, passos de reprodução, versão ou commit e ação emergencial já executada.

## Tratamento de segredos

Quando um segredo entrar no Git, ele deve ser considerado comprometido. Revogue ou rotacione, restrinja o impacto, verifique uso indevido, remova do código e limpe o histórico quando necessário.

## Requisitos mínimos

- dependências verificadas;
- secrets ausentes do Git;
- Actions externas revisadas e preferencialmente fixadas por SHA;
- permissões mínimas do `GITHUB_TOKEN`;
- código não confiável sem acesso a secrets;
- runners privados protegidos;
- vulnerabilidades com owner, severidade e prazo;
- imagens e artefatos críticos verificados.

## Divulgação

Achados internos não devem ser divulgados externamente sem autorização formal da Segurança da Informação e das áreas responsáveis.
