# Guia de contribuição

## 1. Antes de iniciar

Toda mudança relevante deve estar vinculada a uma Issue.

A Issue deve conter:

- problema ou objetivo;
- resultado esperado;
- critérios de aceite;
- sistema ou componente;
- time responsável;
- prioridade;
- risco, quando aplicável;
- ticket interno relacionado durante a transição.

Não inicie desenvolvimento relevante somente por mensagem, reunião ou solicitação verbal.

## 2. Branches

Modelo transitório:

- `main`: versão liberável e produção;
- `develop`: integração, DEV/N2 e preparação de release.

Padrões de nome:

```text
feature/<issue>-<descricao-curta>
fix/<issue>-<descricao-curta>
hotfix/<issue>-<descricao-curta>
infra/<issue>-<descricao-curta>
docs/<issue>-<descricao-curta>
spike/<issue>-<descricao-curta>
```

## 3. Commits

Utilize Conventional Commits.

Exemplos:

```text
feat(api): adicionar consulta de contratos
fix(auth): impedir refresh com token expirado
test(documents): cobrir inscrição estadual vazia
chore(deps): atualizar dependência vulnerável
docs(runbook): documentar rollback do serviço
```

## 4. Pull Requests

O Pull Request deve referenciar a Issue, explicar contexto e alterações, informar como validar, descrever riscos e ambientes afetados e apresentar evidências.

Abra Draft PR quando a mudança exigir colaboração antecipada.

## 5. Revisão

Antes do merge, checks obrigatórios devem estar aprovados, comentários resolvidos e revisões exigidas concluídas.

## 6. Segurança

É proibido versionar arquivos `.env` reais, senhas, tokens, chaves privadas, certificados com chave privada, credenciais de banco, dados pessoais desnecessários ou dumps produtivos não mascarados.

Ao identificar segredo exposto, revogue ou rotacione a credencial, investigue possível uso indevido e remova o conteúdo do repositório e histórico quando necessário.

## 7. Merge

O padrão para feature e correção é squash merge. Branches temporárias devem ser excluídas após o merge.

Push direto, force push e exclusão de branches protegidas são proibidos fora do procedimento formal de exceção.
