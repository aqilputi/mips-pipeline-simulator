import * as mipsinit from './mips_init.js'



class Mips{
    constructor(){
        this.pc = mipsinit.initPC()
        this.instr = mipsinit.initInstructions()
        this.regs = mipsinit.initRegisters()
        this.mem = mipsinit.initMemory()

        this.uc = mipsinit.initControlUnit()
        this.aluControl = mipsinit.initAluControl()
        
        this.ifid = mipsinit.initTempIfId()
        this.idex = mipsinit.initTempIdEx()
        this.exmem = mipsinit.initTempExMem()
        this.memwb = mipsinit.initTempMemWb()

    }

    tickIf(instruction){
        var stalling = 0

        if(this.instr[this.pc/4] == 0)
                this.instr[this.pc/4] = instruction

        // verificador de dependencia
        if(this.pc >= 4){
            if(this.instr[(this.pc-4)/4].name === "lw"){
                if((this.instr[(this.pc)/4].rt ==
                    this.ifid.ir.rt) ||
                   (this.instr[(this.pc)/4].rs ==
                    this.ifid.ir.rt)){
                    console.log("dependencia de dados lw!")
                    this.pc -= 4
                    stalling = 1
                }    
            }
            
        }

        //inicia pipeline
        if(stalling == 1){
            this.ifid.ir = this.stall()
        }else{
            this.ifid.ir = this.instr[(this.pc)/4]
            
        }
        this.ifid.npc = this.pc + 4
        this.pc += 4

        console.log("if instruction: " + this.ifid.ir.name)

        return
    }

    tickId(){
        if(this.ifid.ir != 0)
            this.idex.name = this.ifid.ir.name.slice()
        this.idex.npc = this.ifid.npc


        
        //implementacao do fowarding
        if(this.exmem.regWrite == 1 || this.memwb.regWrite == 1){
            if(this.exmem.rd == this.ifid.ir.rs){
                this.idex.a = this.exmem.aluOut
            }else{
                if(this.memwb.name === "lw" &&
                   this.memwb.rd == this.ifid.ir.rs){
                    this.idex.a = this.memwb.lmd
                    console.log("realizando fowarding")
                    
                }
                else
                    this.idex.a = this.regs[this.ifid.ir.rs]
            }


            if(this.exmem.rd == this.ifid.ir.rt){
                this.idex.b = this.exmem.aluOut
            }else{
                if(this.memwb.name === "lw" &&
                   this.memwb.rd == this.ifid.ir.rt)
                    this.idex.b = this.memwb.lmd
                else
                    this.idex.b = this.regs[this.ifid.ir.rt]
            }
        }else{
            this.idex.a = this.regs[this.ifid.ir.rs]
            this.idex.b = this.regs[this.ifid.ir.rt]
        }
            
        this.idex.rt = this.ifid.ir.rt
        this.idex.rd = this.ifid.ir.rd
        this.idex.imm = this.ifid.ir.imm

        // gerando sinais de controles
        this.getUC(this.ifid.ir, this.uc)

        // salvando sinais de controles em id/ex
        this.idex.regDst = this.uc.regDst
        this.idex.regWrite = this.uc.regWrite
        this.idex.aluSrc = this.uc.aluSrc
        this.idex.aluOp = this.uc.aluOp
        this.idex.pcSrc = this.uc.pcSrc
        this.idex.memRead = this.uc.memRead
        this.idex.memWrite = this.uc.memWrite
        this.idex.memToReg = this.uc.memToReg

        console.log("id instruction: " + this.idex.name)
        return
    }

    tickEx(){
        var mux_b

        this.exmem.name = this.idex.name.slice()
        this.exmem.brtgt = this.idex.npc + this.idex.imm

        if(this.idex.aluSrc == 0)
            mux_b = this.idex.b
        else
            mux_b = this.idex.imm

        //utilizado nome da instrucao em vez de opcode
        console.log(this.exmem.name + " fara " + this.idex.a + " " + mux_b)
        this.aluControl = this.getAluControl(this.idex.aluOp, this.idex.name)
        this.exmem.aluOut = this.useAlu(this.idex.a, mux_b, this.aluControl)

        if(this.exmem.aluOut == 0)
            this.exmem.zero = 1
        else
            this.exmem.zero = 0

        this.exmem.b = this.idex.b

        if(this.idex.regDst == 0)
            this.exmem.rd = this.idex.rt
        else
            this.exmem.rd = this.idex.rd


        // salvando sinais de controles em id/ex
        this.exmem.memToReg = this.idex.memToReg
        this.exmem.regWrite = this.idex.regWrite
        this.exmem.pcSrc = this.idex.pcSrc
        this.exmem.memRead = this.idex.memRead
        this.exmem.memWrite = this.idex.memWrite

        console.log("exmem instruction: " + this.exmem.name)
        return
    }

    tickMem(){
        this.memwb.name = this.exmem.name.slice()
        if(this.exmem.pcSrc == 1)
            this.pc = this.exmem.brtgt

        if(this.exmem.memRead == 1){
            console.log("posicao da memoria: " + this.memwb.aluOut)
            console.log("adquiriu da memoria: " + this.memwb.lmd)
            this.memwb.lmd = this.mem[this.exmem.aluOut]
        }
        
        if(this.exmem.memWrite == 1)
            this.mem[this.exmem.aluOut] = this.exmem.b

        this.memwb.aluOut = this.exmem.aluOut
        this.memwb.rd = this.exmem.rd

        // salvando sinais de controles em id/ex
        this.memwb.memToReg = this.exmem.memToReg
        this.memwb.regWrite = this.exmem.regWrite

        console.log("memwb instruction: " + this.memwb.name)
    }

    tickWb(){
        console.log(this.memwb.rd)
        if(this.memwb.memToReg == 1){
            if(this.memwb.regWrite == 1)
                this.regs[this.memwb.rd] = this.memwb.lmd 

        }else{
            if(this.memwb.regWrite == 1){
                console.log("escrever")
                this.regs[this.memwb.rd] = this.memwb.aluOut
            }
            
        }
        console.log(this.regs)
        console.log(this.mem)
    }

    stall(){
        var stall_instruction = {
            'name' : 'stall',
            'rd' : 0,
            'rs' : 0,
            'rt' : 0,
            'imm' : 0
        }

        return stall_instruction
    }

    useAlu(a, b, aluControl){
        console.log(a)
        console.log(b)
        console.log("aluControl: " + aluControl)
        switch(aluControl){
        case 0:
            return a & b
        case 1:
            return a | b
        case 2:
            return a + b
        case 6:
            return a - b
        case 7:
            if(a < b)
                return 1
            else
                return 0
        }
    }

    getAluControl(aluOp, name){
        switch(aluOp){
        case 0:
            return 2
        case 1:
            return 6
        case 2:
            switch(name){
            case "add":
                return 2
            case "sub":
                return 6
            case "and":
                return 0
            case "or":
                return 1
            case "slt":
                return 7
            case "stall":
                return 0 
            default:
                console.log("instrucao n implementada em alucontrol")
                break
            }
        default:
            console.log("instrucao n implementada em alucontrol")
            break
        } 
        return -1
    }

    getUC(instruction, uc){
        if(instruction == 0){
            uc.regDst = 0
            uc.regWrite = 0
            uc.aluSrc = 0
            uc.aluOp = 0
            uc.pcSrc = 0
            uc.memRead = 0
            uc.memWrite = 0
            uc.memToReg = 0
            return
        }
        switch(instruction.name){
        case "lw":
            uc.regDst = 0
            uc.regWrite = 1
            uc.aluSrc = 1
            uc.aluOp = 0
            uc.pcSrc = 0
            uc.memRead = 1
            uc.memWrite = 0
            uc.memToReg = 1
            break;
        case "sw":
            uc.regWrite = 0
            uc.aluSrc = 1
            uc.aluOp = 0
            uc.pcSrc = 0
            uc.memRead = 0
            uc.memWrite = 1
            break;
        case "beq":
            uc.regWrite = 0
            uc.aluSrc = 0
            uc.aluOp = 1
            uc.pcSrc = 1
            uc.memRead = 0
            uc.memWrite = 0
            break;
        case "stall":
            uc.regDst = 0
            uc.regWrite = 0
            uc.aluSrc = 0
            uc.aluOp = 0
            uc.pcSrc = 0
            uc.memRead = 0
            uc.memWrite = 0
            uc.memToReg = 0
            break;
        default: //tipo r
            uc.regDst = 1
            uc.regWrite = 1
            uc.aluSrc = 0
            uc.aluOp = 2
            uc.pcSrc = 0
            uc.memRead = 0
            uc.memWrite = 0
            uc.memToReg = 0
            break;
        }
        return 1
    }

    
}


export {Mips}
