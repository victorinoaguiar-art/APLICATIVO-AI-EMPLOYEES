# Google Drive Connector — Manual de Operações

## Operações Suportadas
- `drive.file.list`, `drive.file.search`, `drive.file.metadata.read`
- `drive.file.download`, `drive.file.upload`, `drive.file.create`, `drive.folder.create`
- `drive.file.version.read`

## Regras de Governação
- Pesquisa em linguagem natural sem seleção cega do primeiro resultado (desambiguação obrigatória).
- Prevenção de substituição silenciosa de ficheiros (gestão rigorosa de versões).
- Operação de deleção (`delete`) bloqueada por omissão.
