import * as mips from './mips.js'
import './parser.js'

var m = new mips.Mips();



function tick(query){
    try{
        var instruction = parser(query)
    }catch (e){
        console.log(e)
        return
    }

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



//getters

// inteiro
function getPC(){
    return m.pc
}

//vetor de 400 posicoes
function getInstructionMemory(){
    return m.instr
}


//vetor de 30 pos
function getRegisters(){
    return m.regs
}

//vetor de 100 pos
function getMemory(){
    return m.mem
}

/*
  inicializa com
    UC = {'regDst': 0,
              'regWrite' : 0,
              'aluSrc' : 0,
              'aluOp' : 0,
              'pcSrc' : 0,
              'memRead' : 0,
              'memWrite' : 0,
              'memToReg' : 0}


*/
function getUCSignals(){
    return m.uc
}


//inteiro
function getAluControlSignals(){
    return m.aluControl
}

/*
  inicializa com
   ifid = {'npc' : 0,
                'ir': initInstruction()}
 
*/
function getBufferIfId(){
    return m.ifid
}


/*
  inicializa com
  idex = {'regDst': 0,
                'regWrite' : 0,
                'aluSrc' : 0,
                'aluOp' : 0,
                'pcSrc' : 0,
                'memRead' : 0,
                'memWrite' : 0,
                'memToReg' : 0,
                'name' : "stall",
                'npc' : 0,
                'a' : 0,
                'b' : 0,
                'rt' : 0,
                'rd' : 0,
                'imm' : 0,
                'rs' : 0}
 
*/
function getBufferIdEx(){
    return m.idex
}


/*
  inicializa com
    exmem = {'regWrite' : 0,
                 'pcSrc' : 0,
                 'memRead' : 0,
                 'memWrite' : 0,
                 'memToReg' : 0,
                'name' : "stall",
                 'brtgt' : 0,
                 'zero' : 0,
                 'aluOut' : 0,
                 'b' : 0,
                 'rd' : 0
                }
  
*/
function getBufferExMem(){
    return m.exmem
}


/*
   var memwb = {'memWrite' : 0,
                 'memToReg' : 0,
                'name' : "stall",
                 'lmd' : 0,
                 'aluOut' : 0,
                 'rd' : 3,
                }
  
*/
function getBufferMemWb(){
    return m.memwb
}
