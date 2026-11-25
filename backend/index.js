const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const conexao = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// ---------- Segredo usado para assinar as chaves de acesso (tokens) ----------
const arquivoSegredo = path.join(__dirname, 'segredo_jwt.txt');
if (!fs.existsSync(arquivoSegredo)) {
    fs.writeFileSync(arquivoSegredo, crypto.randomBytes(48).toString('hex'));
}
const SEGREDO = fs.readFileSync(arquivoSegredo, 'utf8').trim();

// ---------- Proteção contra tentativas em excesso de adivinhar a senha ----------
const tentativas = {};
const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 15 * 60 * 1000; // 15 minutos

function estaBloqueado(ip) {
    const t = tentativas[ip];
    if (!t) return false;
    if (t.bloqueadoAte && t.bloqueadoAte > Date.now()) return true;
    if (t.bloqueadoAte && t.bloqueadoAte <= Date.now()) delete tentativas[ip];
    return false;
}

function registrarErro(ip) {
    const t = tentativas[ip] || { erros: 0 };
    t.erros += 1;
    if (t.erros >= MAX_TENTATIVAS) {
        t.bloqueadoAte = Date.now() + BLOQUEIO_MS;
    }
    tentativas[ip] = t;
}

// ---------- Funções auxiliares ----------

// Confere se o CPF é válido: 11 números e os dois dígitos verificadores corretos
function cpfValido(cpf) {
    if (!/^\d{11}$/.test(cpf)) {
        return false;
    }
    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += Number(cpf[i]) * (10 - i);
    }
    let resto = soma % 11;
    const digito1 = resto < 2 ? 0 : 11 - resto;
    if (digito1 !== Number(cpf[9])) {
        return false;
    }
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += Number(cpf[i]) * (11 - i);
    }
    resto = soma % 11;
    const digito2 = resto < 2 ? 0 : 11 - resto;
    return digito2 === Number(cpf[10]);
}

// Deixa só os números do CPF (tira pontos e traço)
function limparCpf(cpf) {
    return String(cpf || '').replace(/\D/g, '');
}

// Transforma texto vazio em NULL (para gravar no banco)
function vazioParaNulo(valor) {
    const texto = String(valor ?? '').trim();
    return texto === '' ? null : texto;
}

// ---------- Login ----------
app.post('/login', (req, res) => {
    const ip = req.ip;

    if (estaBloqueado(ip)) {
        return res.status(429).json({ erro: 'Muitas tentativas. Aguarde 15 minutos e tente de novo.' });
    }

    const usuario = String(req.body.usuario || '').trim();
    const senha = String(req.body.senha || '');

    if (usuario === '' || senha === '') {
        return res.status(400).json({ erro: 'Informe o usuário e a senha.' });
    }

    conexao.query('SELECT id, nome, usuario, senha_hash FROM usuarios WHERE usuario = ?', [usuario], async (erro, resultados) => {
        if (erro) {
            console.log('ERRO NO LOGIN (banco):', erro);
            return res.status(500).json({ erro: 'Erro ao fazer login' });
        }

        const encontrado = resultados[0];
        const mensagemErro = 'Usuário ou senha incorretos.';

        if (!encontrado) {
            registrarErro(ip);
            return res.status(401).json({ erro: mensagemErro });
        }

        try {
            const senhaCerta = await bcrypt.compare(senha, encontrado.senha_hash);
            if (!senhaCerta) {
                registrarErro(ip);
                return res.status(401).json({ erro: mensagemErro });
            }

            delete tentativas[ip];

            // A chave de acesso vale por 8 horas
            const token = jwt.sign({ id: encontrado.id, usuario: encontrado.usuario }, SEGREDO, { expiresIn: '8h' });
            res.json({ token, nome: encontrado.nome });
        } catch (erroSenha) {
            console.log('ERRO NO LOGIN (senha):', erroSenha);
            return res.status(500).json({ erro: 'Erro ao fazer login' });
        }
    });
});

// ---------- Porteiro: só deixa passar quem enviar uma chave de acesso válida ----------
function autenticar(req, res, next) {
    const cabecalho = req.headers.authorization || '';
    const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : '';

    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Faça login.' });
    }

    jwt.verify(token, SEGREDO, (erro, dados) => {
        if (erro) {
            return res.status(401).json({ erro: 'Sessão expirada. Faça login de novo.' });
        }
        req.usuarioLogado = dados; // { id, usuario }
        next();
    });
}


// ---------- Trocar a própria senha (exige estar logado) ----------
app.post('/trocar-senha', autenticar, (req, res) => {
    const chave = `troca-${req.usuarioLogado.id}`;

    if (estaBloqueado(chave)) {
        return res.status(429).json({ erro: 'Muitas tentativas. Aguarde 15 minutos e tente de novo.' });
    }

    const senhaAtual = String(req.body.senhaAtual || '');
    const senhaNova = String(req.body.senhaNova || '');

    if (senhaAtual === '' || senhaNova === '') {
        return res.status(400).json({ erro: 'Informe a senha atual e a nova senha.' });
    }
    if (senhaNova.length < 8) {
        return res.status(400).json({ erro: 'A nova senha precisa ter pelo menos 8 caracteres.' });
    }
    if (senhaNova === senhaAtual) {
        return res.status(400).json({ erro: 'A nova senha precisa ser diferente da atual.' });
    }

    conexao.query('SELECT senha_hash FROM usuarios WHERE id = ?', [req.usuarioLogado.id], async (erro, resultados) => {
        if (erro || !resultados[0]) {
            return res.status(500).json({ erro: 'Erro ao trocar a senha' });
        }

        const senhaCerta = await bcrypt.compare(senhaAtual, resultados[0].senha_hash);
        if (!senhaCerta) {
            registrarErro(chave);
            return res.status(400).json({ erro: 'A senha atual está incorreta.' });
        }

        const novoHash = await bcrypt.hash(senhaNova, 10);
        conexao.query('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [novoHash, req.usuarioLogado.id], (erroGravar) => {
            if (erroGravar) {
                return res.status(500).json({ erro: 'Erro ao trocar a senha' });
            }
            delete tentativas[chave];
            res.json({ mensagem: 'Senha trocada com sucesso!' });
        });
    });
});


// =====================================================================
//                              VOLUNTÁRIOS
//   Cada usuário só enxerga e altera os voluntários que ele mesmo cadastrou
// =====================================================================

app.use('/voluntarios', autenticar);

const CAMPOS_VOLUNTARIO = `id, nome, email, telefone, cpf, sexo, idade, estado_civil, status,
    DATE_FORMAT(data_nascimento, '%Y-%m-%d') AS data_nascimento,
    cep, logradouro, numero, complemento, bairro, cidade`;

// Listar os voluntários do usuário logado
app.get('/voluntarios', (req, res) => {
    conexao.query(
        `SELECT ${CAMPOS_VOLUNTARIO} FROM voluntarios WHERE usuario_id = ? ORDER BY id DESC`,
        [req.usuarioLogado.id],
        (erro, resultados) => {
            if (erro) {
                console.log('ERRO AO LISTAR VOLUNTÁRIOS:', erro);
                return res.status(500).json({ erro: 'Erro ao buscar voluntários' });
            }
            res.json(resultados);
        }
    );
});

// Buscar um voluntário (só se for do usuário logado)
app.get('/voluntarios/:id', (req, res) => {
    conexao.query(
        `SELECT ${CAMPOS_VOLUNTARIO} FROM voluntarios WHERE id = ? AND usuario_id = ?`,
        [req.params.id, req.usuarioLogado.id],
        (erro, resultados) => {
            if (erro) {
                return res.status(500).json({ erro: 'Erro ao buscar voluntário' });
            }
            res.json(resultados[0]);
        }
    );
});

// Cadastrar um novo voluntário
app.post('/voluntarios', (req, res) => {
    const donoId = req.usuarioLogado.id;
    const { nome, email, telefone, sexo, estado_civil } = req.body;
    const cpf = limparCpf(req.body.cpf);

    if (!cpfValido(cpf)) {
        return res.status(400).json({ erro: 'CPF inválido. Confira os 11 números.' });
    }

    conexao.query('SELECT id FROM voluntarios WHERE cpf = ? AND usuario_id = ?', [cpf, donoId], (erro, existentes) => {
        if (erro) {
            return res.status(500).json({ erro: 'Erro ao verificar o CPF' });
        }
        if (existentes.length > 0) {
            return res.status(409).json({ erro: 'Você já cadastrou um voluntário com este CPF.' });
        }
        const sql = `INSERT INTO voluntarios
            (usuario_id, nome, email, telefone, cpf, sexo, idade, estado_civil,
             data_nascimento, cep, logradouro, numero, complemento, bairro, cidade)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const valores = [
            donoId, nome, email, telefone, cpf, sexo, vazioParaNulo(req.body.idade), estado_civil,
            vazioParaNulo(req.body.data_nascimento), vazioParaNulo(req.body.cep),
            vazioParaNulo(req.body.logradouro), vazioParaNulo(req.body.numero),
            vazioParaNulo(req.body.complemento), vazioParaNulo(req.body.bairro),
            vazioParaNulo(req.body.cidade)
        ];
        conexao.query(sql, valores, (erroGravar, resultado) => {
            if (erroGravar) {
                console.log('ERRO AO CADASTRAR VOLUNTÁRIO:', erroGravar);
                return res.status(500).json({ erro: 'Erro ao cadastrar voluntário' });
            }
            res.status(201).json({ mensagem: 'Voluntário cadastrado com sucesso!', id: resultado.insertId });
        });
    });
});

// Atualizar um voluntário (só se for do usuário logado)
app.put('/voluntarios/:id', (req, res) => {
    const donoId = req.usuarioLogado.id;
    const { id } = req.params;
    const { nome, email, telefone, sexo, estado_civil } = req.body;
    const cpf = limparCpf(req.body.cpf);

    if (!cpfValido(cpf)) {
        return res.status(400).json({ erro: 'CPF inválido. Confira os 11 números.' });
    }

    conexao.query('SELECT id FROM voluntarios WHERE cpf = ? AND usuario_id = ? AND id <> ?', [cpf, donoId, id], (erro, existentes) => {
        if (erro) {
            return res.status(500).json({ erro: 'Erro ao verificar o CPF' });
        }
        if (existentes.length > 0) {
            return res.status(409).json({ erro: 'Você já cadastrou outro voluntário com este CPF.' });
        }
        const sql = `UPDATE voluntarios SET nome=?, email=?, telefone=?, cpf=?, sexo=?, idade=?, estado_civil=?,
            data_nascimento=?, cep=?, logradouro=?, numero=?, complemento=?, bairro=?, cidade=?
            WHERE id=? AND usuario_id=?`;
        const valores = [
            nome, email, telefone, cpf, sexo, vazioParaNulo(req.body.idade), estado_civil,
            vazioParaNulo(req.body.data_nascimento), vazioParaNulo(req.body.cep),
            vazioParaNulo(req.body.logradouro), vazioParaNulo(req.body.numero),
            vazioParaNulo(req.body.complemento), vazioParaNulo(req.body.bairro),
            vazioParaNulo(req.body.cidade), id, donoId
        ];
        conexao.query(sql, valores, (erroGravar, resultado) => {
            if (erroGravar) {
                console.log('ERRO AO ATUALIZAR VOLUNTÁRIO:', erroGravar);
                return res.status(500).json({ erro: 'Erro ao atualizar voluntário' });
            }
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ erro: 'Voluntário não encontrado.' });
            }
            res.json({ mensagem: 'Voluntário atualizado com sucesso!' });
        });
    });
});

// Alterar status do voluntário (Ativo / Inativo)
app.patch('/voluntarios/:id/status', (req, res) => {
    const { status } = req.body;
    if (!['Ativo', 'Inativo'].includes(status)) {
        return res.status(400).json({ erro: 'Status inválido.' });
    }
    conexao.query(
        'UPDATE voluntarios SET status = ? WHERE id = ? AND usuario_id = ?',
        [status, req.params.id, req.usuarioLogado.id],
        (erro, resultado) => {
            if (erro) {
                return res.status(500).json({ erro: 'Erro ao alterar status' });
            }
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ erro: 'Voluntário não encontrado.' });
            }
            res.json({ mensagem: 'Status atualizado!' });
        }
    );
});

// Deletar um voluntário
app.delete('/voluntarios/:id', (req, res) => {
    conexao.query(
        'DELETE FROM voluntarios WHERE id = ? AND usuario_id = ?',
        [req.params.id, req.usuarioLogado.id],
        (erro, resultado) => {
            if (erro) {
                return res.status(500).json({ erro: 'Erro ao deletar voluntário' });
            }
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ erro: 'Voluntário não encontrado.' });
            }
            res.json({ mensagem: 'Voluntário deletado com sucesso!' });
        }
    );
});


// =====================================================================
//                          PESSOAS ASSISTIDAS
//   Cada usuário só enxerga e altera as pessoas que ele mesmo cadastrou
// =====================================================================

app.use('/assistidos', autenticar);

const CAMPOS_ASSISTIDO = `id, nome, cpf, DATE_FORMAT(data_nascimento, '%Y-%m-%d') AS data_nascimento,
    email, telefone, cep, logradouro, numero, complemento, bairro, cidade, status`;

function lerAssistido(body) {
    return {
        nome: String(body.nome || '').trim(),
        cpf: vazioParaNulo(limparCpf(body.cpf)),
        data_nascimento: vazioParaNulo(body.data_nascimento),
        email: vazioParaNulo(body.email),
        telefone: String(body.telefone || '').trim(),
        cep: vazioParaNulo(body.cep),
        logradouro: vazioParaNulo(body.logradouro),
        numero: vazioParaNulo(body.numero),
        complemento: vazioParaNulo(body.complemento),
        bairro: vazioParaNulo(body.bairro),
        cidade: vazioParaNulo(body.cidade)
    };
}

function validarAssistido(a) {
    if (a.nome === '' || a.telefone === '') {
        return 'Nome e telefone são obrigatórios.';
    }
    if (a.cpf && !cpfValido(a.cpf)) {
        return 'CPF inválido. Confira os 11 números.';
    }
    return null;
}

// Listar as pessoas assistidas do usuário logado
app.get('/assistidos', (req, res) => {
    conexao.query(
        `SELECT ${CAMPOS_ASSISTIDO} FROM assistidos WHERE usuario_id = ? ORDER BY id DESC`,
        [req.usuarioLogado.id],
        (erro, resultados) => {
            if (erro) {
                return res.status(500).json({ erro: 'Erro ao buscar pessoas assistidas' });
            }
            res.json(resultados);
        }
    );
});

// Buscar uma (só se for do usuário logado)
app.get('/assistidos/:id', (req, res) => {
    conexao.query(
        `SELECT ${CAMPOS_ASSISTIDO} FROM assistidos WHERE id = ? AND usuario_id = ?`,
        [req.params.id, req.usuarioLogado.id],
        (erro, resultados) => {
            if (erro) {
                return res.status(500).json({ erro: 'Erro ao buscar pessoa assistida' });
            }
            res.json(resultados[0]);
        }
    );
});

// Cadastrar
app.post('/assistidos', (req, res) => {
    const a = lerAssistido(req.body);
    const erroValidacao = validarAssistido(a);
    if (erroValidacao) {
        return res.status(400).json({ erro: erroValidacao });
    }

    const sql = `INSERT INTO assistidos
        (usuario_id, nome, cpf, data_nascimento, email, telefone, cep, logradouro, numero, complemento, bairro, cidade)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const valores = [req.usuarioLogado.id, a.nome, a.cpf, a.data_nascimento, a.email, a.telefone, a.cep, a.logradouro, a.numero, a.complemento, a.bairro, a.cidade];

    conexao.query(sql, valores, (erro, resultado) => {
        if (erro) {
            if (erro.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ erro: 'Você já cadastrou uma pessoa assistida com este CPF.' });
            }
            console.log('ERRO AO CADASTRAR ASSISTIDO:', erro);
            return res.status(500).json({ erro: 'Erro ao cadastrar pessoa assistida' });
        }
        res.status(201).json({ mensagem: 'Pessoa assistida cadastrada com sucesso!', id: resultado.insertId });
    });
});

// Atualizar (só se for do usuário logado)
app.put('/assistidos/:id', (req, res) => {
    const a = lerAssistido(req.body);
    const erroValidacao = validarAssistido(a);
    if (erroValidacao) {
        return res.status(400).json({ erro: erroValidacao });
    }

    const sql = `UPDATE assistidos SET nome=?, cpf=?, data_nascimento=?, email=?, telefone=?,
        cep=?, logradouro=?, numero=?, complemento=?, bairro=?, cidade=?
        WHERE id=? AND usuario_id=?`;
    const valores = [a.nome, a.cpf, a.data_nascimento, a.email, a.telefone, a.cep, a.logradouro, a.numero, a.complemento, a.bairro, a.cidade, req.params.id, req.usuarioLogado.id];

    conexao.query(sql, valores, (erro, resultado) => {
        if (erro) {
            if (erro.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ erro: 'Você já cadastrou outra pessoa assistida com este CPF.' });
            }
            console.log('ERRO AO ATUALIZAR ASSISTIDO:', erro);
            return res.status(500).json({ erro: 'Erro ao atualizar pessoa assistida' });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Pessoa assistida não encontrada.' });
        }
        res.json({ mensagem: 'Pessoa assistida atualizada com sucesso!' });
    });
});

// Alterar status (Ativo / Inativo)
app.patch('/assistidos/:id/status', (req, res) => {
    const { status } = req.body;
    if (!['Ativo', 'Inativo'].includes(status)) {
        return res.status(400).json({ erro: 'Status inválido.' });
    }
    conexao.query(
        'UPDATE assistidos SET status = ? WHERE id = ? AND usuario_id = ?',
        [status, req.params.id, req.usuarioLogado.id],
        (erro, resultado) => {
            if (erro) {
                return res.status(500).json({ erro: 'Erro ao alterar status' });
            }
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ erro: 'Pessoa assistida não encontrada.' });
            }
            res.json({ mensagem: 'Status atualizado!' });
        }
    );
});

// Excluir
app.delete('/assistidos/:id', (req, res) => {
    conexao.query(
        'DELETE FROM assistidos WHERE id = ? AND usuario_id = ?',
        [req.params.id, req.usuarioLogado.id],
        (erro, resultado) => {
            if (erro) {
                return res.status(500).json({ erro: 'Erro ao excluir pessoa assistida' });
            }
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ erro: 'Pessoa assistida não encontrada.' });
            }
            res.json({ mensagem: 'Pessoa assistida excluída com sucesso!' });
        }
    );
});


// =====================================================================
//                       USUÁRIOS DO SISTEMA (LOGIN)
// =====================================================================

app.use('/usuarios', autenticar);

// Listar usuários (nunca devolve a senha)
app.get('/usuarios', (req, res) => {
    conexao.query('SELECT id, nome, usuario FROM usuarios ORDER BY nome', (erro, resultados) => {
        if (erro) {
            return res.status(500).json({ erro: 'Erro ao buscar usuários' });
        }
        res.json(resultados);
    });
});

// Cadastrar usuário
app.post('/usuarios', async (req, res) => {
    const nome = String(req.body.nome || '').trim();
    const usuario = String(req.body.usuario || '').trim();
    const senha = String(req.body.senha || '');

    if (nome.length < 3 || usuario.length < 3 || /\s/.test(usuario)) {
        return res.status(400).json({ erro: 'Nome ou usuário inválido. O usuário não pode ter espaços.' });
    }
    if (senha.length < 8) {
        return res.status(400).json({ erro: 'A senha precisa ter pelo menos 8 caracteres.' });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        conexao.query(
            'INSERT INTO usuarios (nome, usuario, senha_hash) VALUES (?, ?, ?)',
            [nome, usuario, senhaHash],
            (erro, resultado) => {
                if (erro) {
                    if (erro.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ erro: 'Esse nome de usuário já existe. Escolha outro.' });
                    }
                    console.log('ERRO AO CRIAR USUÁRIO:', erro);
                    return res.status(500).json({ erro: 'Erro ao criar o usuário' });
                }
                res.status(201).json({ mensagem: 'Usuário criado com sucesso!', id: resultado.insertId });
            }
        );
    } catch (erroHash) {
        res.status(500).json({ erro: 'Erro ao criar o usuário' });
    }
});

// Excluir usuário (não deixa excluir a si mesmo, o último usuário, nem quem tem cadastros)
app.delete('/usuarios/:id', (req, res) => {
    const id = Number(req.params.id);

    if (id === req.usuarioLogado.id) {
        return res.status(400).json({ erro: 'Você não pode excluir o seu próprio usuário.' });
    }

    conexao.query('SELECT COUNT(*) AS total FROM usuarios', (erro, resultados) => {
        if (erro) {
            return res.status(500).json({ erro: 'Erro ao excluir usuário' });
        }
        if (resultados[0].total <= 1) {
            return res.status(400).json({ erro: 'Não é possível excluir o último usuário.' });
        }
        conexao.query('DELETE FROM usuarios WHERE id = ?', [id], (erroExcluir) => {
            if (erroExcluir) {
                if (erroExcluir.code === 'ER_ROW_IS_REFERENCED_2') {
                    return res.status(409).json({ erro: 'Esse usuário ainda tem voluntários ou pessoas assistidas cadastrados e não pode ser excluído.' });
                }
                return res.status(500).json({ erro: 'Erro ao excluir usuário' });
            }
            res.json({ mensagem: 'Usuário excluído com sucesso!' });
        });
    });
});


const PORTA = 3001;
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});