# Google Sheets Connector — Manual de Operações

## Operações Suportadas
- `sheets.create`, `sheets.metadata.read`, `sheets.values.read`, `sheets.range.read`
- `sheets.range.update`, `sheets.rows.append`, `sheets.export_xlsx`, `sheets.export_csv`

## Autorização por Intervalo (`AuthorizedSheetRange`)
- Permissões diferenciadas por aba/intervalo (ex.: Leitura em 'Inputs', Escrita em 'Resultados', Bloqueio em 'FolhaPagamento').
- Bloqueio de execução de macros e Google Apps Script.
- Validação de integridade e tipos de dados antes de efetuar `batch.update`.
