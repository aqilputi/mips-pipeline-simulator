var badStringErr = "Bad formatted String"

function inRange(num, min, max){
	return num >= min && num <= max
}

function number(num) {
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

function register(reg){
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

function reference(refer){
	var index = refer.indexOf('(')

	if (index == -1 || !refer.endsWith(')'))
		throw badStringErr

	return [number(refer.slice(0, index)), register(refer.slice(index + 1, -1))]
}

function parser(instruction){
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

	return parsed
}

export {parser}
