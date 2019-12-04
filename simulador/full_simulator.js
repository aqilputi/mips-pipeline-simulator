export function initInstruction(){
    var instruction = {
        'name' : 'stall',
        'rd' : 0,
        'rs' : 0,
        'rt' : 0,
        'imm' : 0  
    } 
    return instruction
}
export function initInstructions(){
    var regs = new Array(400)
    for(var i=0; i < regs.length; i++){
        regs[i] = 0
    }
    return regs
}

export function initRegisters(){
    var regs = new Array(30)
    for(var i=0; i < regs.length; i++){
        regs[i] = 10-i
    }
    return regs
}

export function initMemory(){
    var mem = new Array(100)
    for(var i=0; i < mem.length; i++){
        mem[i] = 10-i
    }

    return mem
}

export function initControlUnit(){
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

export function initAluControl(){
    return 0
}

export function initTempIfId(){
    var ifid = {'npc' : 0,
                'instruction' : "nop",
                'ir': initInstruction()}
    return ifid
}

export function initTempIdEx(){
    var idex = {'regDst': 0,
                'regWrite' : 0,
                'aluSrc' : 0,
                'aluOp' : 0,
                'pcSrc' : 0,
                'memRead' : 0,
                'memWrite' : 0,
                'memToReg' : 0,
                'name' : "stall",
                'instruction' : "nop",
                'npc' : 0,
                'a' : 0,
                'b' : 0,
                'rt' : 0,
                'rd' : 0,
                'imm' : 0,
                'rs' : 0}
    return idex
}

export function initTempExMem(){
    var exmem = {'regWrite' : 0,
                 'pcSrc' : 0,
                 'memRead' : 0,
                 'memWrite' : 0,
                 'memToReg' : 0,
                'name' : "stall",
                 'instruction' : "nop",
                 'brtgt' : 0,
                 'zero' : 0,
                 'aluOut' : 0,
                 'b' : 0,
                 'rd' : 0
                }
    return exmem
}

export function initTempMemWb(){
    var memwb = {'memWrite' : 0,
                 'memToReg' : 0,
                'name' : "stall",
                 'instruction' : "nop",
                 'lmd' : 0,
                 'aluOut' : 0,
                 'rd' : 3,
                }
    return memwb
}

export function initPC(){
    return 0
}


class Mips{
    constructor(){
        this.pc = initPC()
        this.instr = initInstructions()
        this.regs = initRegisters()
        this.mem = initMemory()

        this.uc = initControlUnit()
        this.aluControl = initAluControl()
        
        this.ifid = initTempIfId()
        this.idex = initTempIdEx()
        this.exmem = initTempExMem()
        this.memwb = initTempMemWb()

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
            this.ifid.instruction = 'nop'
        }else{
            this.ifid.ir = this.instr[(this.pc)/4]
            this.ifid.instruction = this.instr[(this.pc)/4].instruction.slice()
            
        }
        this.ifid.npc = this.pc + 4
        this.pc += 4

        console.log("if instruction: " + this.ifid.ir.name)

        return
    }

    tickId(){
        this.idex.instruction = this.ifid.instruction.slice()
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

        console.log(this.idex.instruction)
        this.exmem.instruction = this.idex.instruction.slice()
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
        this.memwb.instruction = this.exmem.instruction.slice()
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
            uc.regDst = 'x'
            uc.regWrite = 0
            uc.aluSrc = 1
            uc.aluOp = 0
            uc.pcSrc = 0
            uc.memRead = 0
            uc.memWrite = 1
            uc.memToReg = 'x'
            break;
        case "beq":
            uc.regDst = 'x'
            uc.regWrite = 0
            uc.aluSrc = 0
            uc.aluOp = 1
            uc.pcSrc = 1
            uc.memRead = 0
            uc.memWrite = 0
            uc.memToReg = 'x'
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

var badStringErr = "Bad formatted String"

export function inRange(num, min, max){
	return num >= min && num <= max
}

export function number(num) {
	var result = 0

	console.log(num)

	if (num.length == 0)
		throw badStringErr

	for (var i = 0; i < num.length; ++i) {
		if (inRange(num[i], '0', '9'))
			result = 10 * result + num[i] * 1
		else
			throw badStringErr
	}

	return result
}

export function register(reg){
	var temp
	if (reg[0] != '$')
		throw badStringErr

	switch(reg[1]){
		case 'z':
			if(reg == "$zero")
				return 0
			else 
				throw badStringErr

		case 'v':
			temp = number(reg.slice(2))

			if(inRange(temp, 0, 1))
				return 2 + temp
			else
				throw badStringErr

		case 'a':
			temp = number(reg.slice(2))

			if(inRange(temp, 0, 3))
				return 4 + temp
			else
				throw badStringErr

		case 't':
			temp = number(reg.slice(2))

			if (temp < 0)
				throw badStringErr

			if(temp <= 7)
				return 8 + temp
			else if (temp <= 9)
				return 16 + temp
			else
				throw badStringErr

		case 's':
			if(reg[2] == 'p' && reg.length == 3)
				return 29

			temp = number(reg.slice(2))

			if(inRange(temp, 0, 7))
				return 16 + temp
			else
				throw badStringErr

		default:
			switch(reg){
				case "$gp":
					return 28

				case "$fp": 
					return 30

				case "$ra": 
					return 31

				default:
					throw badStringErr
			}
	}
}

export function reference(refer){
	var index = refer.indexOf('(')

	if (index == -1 || !refer.endsWith(')'))
		throw badStringErr

	return [number(refer.slice(0, index)), register(refer.slice(index + 1, -1))]
}

export function parser(instruction){
    var old_instruction = instruction
	var parsed = new(Object)

	if (typeof(instruction) != "string")
		throw "\'instruction\' must be of String type"

	instruction = instruction.trim().split(' ')
	if (instruction.length > 4)
		throw badStringErr

	parsed.name = instruction[0]

	for (var i = 1; i < instruction.length - 1; ++i) {
		if (!instruction[i].endsWith(','))
			throw badStringErr
		instruction[i] = instruction[i].slice(0, -1)
	}

	switch(parsed.name){
		case "lw":
		case "sw":
			parsed.rt = register(instruction[1])
			var temp = reference(instruction[2])
			parsed.imm = temp[0]
			parsed.rs = temp[1]
			parsed.rd = 0
			break

		case "nop":
			parsed.rt = 0
			parsed.imm = 0
			parsed.rs = 0
			parsed.rd = 0
		break

		case "add":
		case "sub":
		case "and":
		case "or":
		case "slt": //tipo r
			parsed.rs = register(instruction[2])
			parsed.rt = register(instruction[3])
			parsed.rd = register(instruction[1])
			parsed.imm = 0
			break

		default:
			throw badStringErr
	}

    parsed.instruction = old_instruction.slice()
	return parsed
}


var m = new Mips();

export function tick(query){
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

tick("add $t0, $t1, $t2")
tick("lw $t4, 0($t1)")
tick("sub $t0, $t1, $t2")
tick("sw $t3, 0($s1)")
tick("and $t5, $t2, $t1")
tick("and $t5, $t2, $t1")
tick("and $t5, $t2, $t1")
tick("and $t5, $t2, $t1")
tick("and $t5, $t2, $t1")




//getters

// inteiro
export function getPC(){
    return m.pc
}

//vetor de 400 posicoes
export function getInstructionMemory(){
    return m.instr
}


//vetor de 30 pos
export function getRegisters(){
    return m.regs
}

//vetor de 100 pos
export function getMemory(){
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
export function getUCSignals(){
    return m.uc
}


//inteiro
export function getAluControlSignals(){
    return m.aluControl
}

/*
  inicializa com
   ifid = {'npc' : 0,
                'ir': initInstruction()}
 
*/
export function getBufferIfId(){
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
export function getBufferIdEx(){
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
export function getBufferExMem(){
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
export function getBufferMemWb(){
    return m.memwb
}

export function reset(){
    m = new Mips()
}
