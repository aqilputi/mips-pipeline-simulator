function initRegisters(){
    var regs = new Array(10)
    for(var i=0; i < regs.length; i++){
        regs[i] = 10-i
    }
    return regs
}

function initMemory(){
    var mem = new Array(100)
    for(var i=0; i < mem.length; i++){
        mem[i] = 10-i
    }

    return mem
}

function initControlUnit(){
    var UC = {'regDst': 0,
              'regWrite' : 0,
              'aluSrc' : 0,
              'aluOp' : 0,
              'pcSrc' : 0,
              'memRead' : 0,
              'memWrite' : 0,
              'memToReg' : 0}

    return UC
}

function initAluControl(){
    return 0
}

function initTempIfId(){
    var ifid = {'npc' : 0,
                'ir': 0}
    return ifid
}

function initTempIdEx(){
    var idex = {'regDst': 0,
                'regWrite' : 0,
                'aluSrc' : 0,
                'aluOp' : 0,
                'pcSrc' : 0,
                'memRead' : 0,
                'memWrite' : 0,
                'memToReg' : 0,
                'name' : "NaN",
                'npc' : 0,
                'a' : 0,
                'b' : 0,
                'rt' : 0,
                'rd' : 0,
                'imm' : 0,
                'rs' : 0}
    return idex
}

function initTempExMem(){
    var exmem = {'regWrite' : 0,
                 'pcSrc' : 0,
                 'memRead' : 0,
                 'memWrite' : 0,
                 'memToReg' : 0,
                 'brtgt' : 0,
                 'zero' : 0,
                 'aluOut' : 0,
                 'b' : 0,
                 'rd' : 0
                }
    return exmem
}

function initTempMemWb(){
    var memwb = {'memWrite' : 0,
                 'memToReg' : 0,
                 'lmd' : 0,
                 'aluOut' : 0,
                 'rd' : 3,
                }
    return memwb
}

function initPC(){
    return 0
}

export {initRegisters}
export {initMemory}
export {initControlUnit}
export {initAluControl}
export {initTempIfId}
export {initTempIdEx}
export {initTempExMem}
export {initTempMemWb}
export {initPC}
