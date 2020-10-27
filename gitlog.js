const fs = require('fs')
const path = require('path')
const { exit, argv } = require('process')
const exec = require('child_process').exec

// CONFIG - files
let prefix = '/'
const resumo = 'git_commit.log'
const author = 'git_author.log'

// Results
let commits = []
let authors = []
let gitData = ""

// Pegando os dados do GIT (rodar no path do repositório)
const getGitData = (cb) => {
    // Mostrar HELP
    var i = argv.findIndex(a => a == '-h' || a == '--help' || a == '/?')
    if (argv.length < 3 || i >= 0) {
        console.log(`
    - GitLog - 

    # Description: cria arquivos de dados (JSON) à partir de um repositório Git local.
        [prefix] resume.log     Todos os commits do repositório;
        [prefix] author.log     Dados dos autores de commits do repositório.

    # Require: NodeJs (version 12++).
    # Usage: node gitlog <options> 

        -d path         Caminho do repositório Git;
        -p string       Prefixa o nome dos arquivos de log com a "string" indicada;

        -h, 
        --help, 
        /? ou vazio     Mostram essse help.
    
    # Bug: no Windows, não indique um caminho diferente do drive principal (C:). 
        Para rodar em outro drive (ex.: D:), copie e rode GitLog nesse drive.

    ---------------------------------------------------------------------------------¬
    GitLog by BillRocha <prbr@ymail.com>
    MIT License - <https://github.com/pedra/gitlog>
        `)
        exit()
    }

    // Diretório de execução do GIT 
    var target = ""
    var i = argv.findIndex(a => a == '-d')
    if (i >= 0 && argv[i + 1]) target = `cd ${path.resolve(argv[i + 1])} && `

    // Prefix output file name
    var i = argv.findIndex(a => a == '-p')
    if (i >= 0 && argv[i + 1]) prefix = `/${argv[i + 1]}_`

    var t = exec(`${target}git log --shortstat`, (e, stdout, stderr) => {
        if (e) {
            console.log(stderr)
            exit(1)
        }
        gitData = stdout
        cb()
    })
}


// @ desc Cria o objeto "Commit" com os dados de cada commit
const processCommit = commit => {
    var cmt = {
        commit: null,
        author: null,
        email: null,
        date: null,
        change: null,
        insertion: null,
        deletion: null
    }
    // get commit
    commit.map(c => {
        if (c.substr(0, 7) == "commit ") {
            cmt.commit = c.substr(7).trim()
        } else if (c.substr(0, 7) == "Author:") {
            var a = c.substr(7).trim()
            var regex = /(.+)\<((.+)@(.+))\>/
            var match = regex.exec(a)
            cmt.author = match[1].trim()
            cmt.email = match[2]
        } else if (c.substr(0, 5) == "Date:") {
            cmt.date = new Date(c.substr(5).trim())
        } else {
            var r = c.split(',')
            cmt.change = parseInt(r[0]) || 0
            cmt.insertion = parseInt(r[1]) || 0
            cmt.deletion = parseInt(r[2]) || 0
        }
    })

    if (cmt.date === null) console.log("ERROR", cmt)
    commits.push(cmt)
}

// @desc Processa o resumo dos autores
const processAuthors = () => {
    // loop
    commits.map(cmt => {
        if (!authors.find(a => a.email == cmt.email)) {
            authors.push({
                author: cmt.author,
                email: cmt.email,
                change: cmt.change,
                insertion: cmt.insertion,
                deletion: cmt.deletion
            })
        } else {
            var i = authors.findIndex(i => i.email == cmt.email)
            if (i >= 0) {
                authors[i].change += cmt.change
                authors[i].insertion += cmt.insertion
                authors[i].deletion += cmt.deletion
            }
        }
    })
    // Salvando log
    fs.writeFileSync(path.join(__dirname, prefix + author), JSON.stringify(authors, null, 2), 'utf8', e => console.log(e))
}


// ------------------------------------------------------------------[ LOOP ]
// @desc Loop principal de leitura de cada linha do arquivo de log
// @example: git log --shortstat >> ./../core_teste.log
const Loop = () => {

    // split the contents by new line
    const lines = gitData.split(/\r?\n/)
    let commit = []
    let counter = 0

    // print all lines
    lines.forEach((line) => {
        //pegando início do bloco de commit
        if (line.substr(0, 7) == "commit ") {
            if (commit.length > 0) processCommit(commit)
            counter++
            commit = []
            commit.push(line)
        } else {
            if (line.substr(0, 4).trim() != '') commit.push(line.trim())
        }
    })
    // Pega o último elemento ...
    processCommit(commit)

    // Coloca em ordem crescente.
    commits.reverse()

    // Write output file
    if (commits.length < counter) console.error("Processamento incorreto!")
    else fs.writeFileSync(path.join(__dirname, prefix + resumo), JSON.stringify(commits, null, 2), 'utf8', e => console.log(e))
}


// ---------------------------------------------------------- [ RUNNING ]
getGitData(() => {
    Loop() // Processando os dados brutos para json    
    processAuthors() // Processando authors resumo

    // Saindo...
    console.log(`
    Total

    # commits: ${commits.length}
    # autores: ${authors.length}

    -----------------------------------------------¬
    GitLog by BillRocha <prbr@ymail.com>
    MIT License - <https://github.com/pedra/gitlog>`)
})