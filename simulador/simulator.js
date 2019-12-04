
import * as mips from './mips.js'

var m = new mips.Mips();

var instruction1 = {
    'name' : 'add',
    'rd' : 0,
    'rs' : 1,
    'rt' : 2,
    'imm' : 0
}

var instruction2 = {
    'name' : 'sw',
    'rd' : 7,
    'rs' : 9,
    'rt' : 8,
    'imm' : 0
}


var instruction3 = {
    'name' : 'lw',
    'rd' : 2,
    'rs' : 5,
    'rt' : 4,
    'imm' : 0
}


var instruction4 = {
    'name' : 'sub',
    'rd' : 1,
    'rs' : 2,
    'rt' : 3,
    'imm' : 0
}


var instruction5 = {
    'name' : 'add',
    'rd' : 0,
    'rs' : 4,
    'rt' : 5,
    'imm' : 0
}




//precisa jogar uma instrucao ai em if por enquanto
function tick(){
        m.tickWb()
        m.tickMem()
        m.tickEx()
        m.tickId()
        m.tickIf(instruction3)
}

tick()
