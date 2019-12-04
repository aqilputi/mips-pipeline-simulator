
import * as mips from './mips.js'
import * as parser from './parser.js'

var m = new mips.Mips();



function tick(query){
    var instruction = parser.parser(query)

    m.tickWb()
    m.tickMem()
    m.tickEx()
    m.tickId()
    m.tickIf(instruction)
}

// teste

tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')
tick('add $t0, $t1, $t0')



//getters
function getPC(){
    return m.pc
}

function getInstructionMemory(){
    return m.instr
}

function getRegisters(){
    return m.regs
}

function getMemory(){
    return m.mem
}

function getUCSignals(){
    return m.uc
}

function getAluControlSignals(){
    return m.aluControl
}

function getBufferIfId(){
    return m.ifid
}

function getBufferIdEx(){
    return m.idex
}

function getBufferExMem(){
    return m.exmem
}
function getBufferMemWb(){
    return m.memwb
}
