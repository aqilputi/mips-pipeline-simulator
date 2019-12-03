import * as mipsinit from './mips_init.js'

var instruction = {
    'name' : 'add',
    'rd' : 0,
    'rs' : 1,
    'rt' : 2,
    'imm' : 0
}

class Mips{
    constructor(){
        this.pc = mipsinit.initPC()
        this.regs = mipsinit.initRegisters()
        this.mem = mipsinit.initMemory()
        this.uc = mipsinit.initControlUnit()
        this.ifid = mipsinit.initTempIfId()
        this.idex = mipsinit.initTempIdEx()
        this.exmem = mipsinit.initTempExMem()
        this.memwb = mipsinit.initTempMemWb()
    }

    tickIf(){
        // colocar instrucao no IR
        this.ifid.ir = instruction
        this.ifid.npc = this.pc + 4
        this.pc += 4
        return
    }

    tickId(){
        this.idex.npc = this.ifid.npc
        this.idex.a = this.reg[this.ifid.ir.rs]
        this.idex.b = this.reg[this.ifid.ir.rt]
        
        
    }

    
}


export {Mips}
