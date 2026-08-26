# Tecnologia Ouro Safra

Este espaço concentra os repositórios corporativos utilizados pelos times de Desenvolvimento, RPA, Dados e Plataforma.

## Núcleos lógicos

- **Frontend:** aplicações web, componentes e pacotes de frontend.
- **Backend:** APIs, serviços e componentes de backend.
- **Jobs:** automações, RPAs, pipelines de dados e rotinas agendadas.
- **Platform:** templates, workflows, infraestrutura como código e padrões corporativos.

## Fluxo de trabalho

Toda mudança relevante deve seguir esta trilha:

```text
Issue → branch → Pull Request → CI e revisão → release → deploy → evidência
```

Branches protegidas não devem receber push direto. Alterações devem ser integradas por Pull Request e passar pelos checks definidos para cada repositório.

## Segurança

Não armazene senhas, tokens, chaves privadas, wallets, arquivos `.env` reais ou dados pessoais desnecessários no Git.

Consulte a política corporativa em `SECURITY.md`.
