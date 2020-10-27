# GitLog 

## Description 
    
Cria arquivos de dados (JSON) à partir de um repositório Git local.<br>
[prefix] resume.log     Todos os commits do repositório;<br>
[prefix] author.log     Dados dos autores de commits do repositório.

## Require 
    
NodeJs (version 12++).

## Usage
    
    node gitlog <options> 

        -d path         Caminho do repositório Git;
        -p string       Prefixa o nome dos arquivos de log com a "string" indicada;

        -h, 
        --help, 
        /? ou vazio     Mostram essse help.
    
## Bug
    
No Windows, não indique um caminho diferente do drive principal (C:).<br>
Para rodar em outro drive (ex.: D:), copie e rode GitLog nesse drive.

## Credits

GitLog by BillRocha <prbr@ymail.com><br>
MIT License - <https://github.com/pedra/gitlog>
