var badStringErr = "Bad formatted String"

function number(num) {
	var temp = parseInt(num)

	if (isNaN(temp))
		throw badStringErr

	return temp
}

function inRange(num, min, max){
	return num >= min && num <= max
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
			temp = parseInt(reg.slice(2))

			if(inRange(temp, 0, 1))
				return 2 + temp
			else
				throw badStringErr

		case 'a':
			temp = parseInt(reg.slice(2))

			if(inRange(temp, 0, 3))
				return 4 + temp
			else
				throw badStringErr

		case 't':
			temp = parseInt(reg.slice(2))

			if (temp < 0)
				throw badStringErr

			if(temp <= 7)
				return 8 + temp
			else if (temp <= 9)
				return 24 + temp
			else
				throw badStringErr

		case 's':
			temp = parseInt(reg.slice(2))

			if(inRange(temp, 0, 7))
				return 16 + temp
			else
				throw badStringErr

		default:
			switch(reg){
				case "$gp":
					return 28

				case "$sp": 
					return 29

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

	return [number(refer.slice(0, index - 1)), register(refer.slice(index + 1, -1))]
}

function parser(instruction){
	var parsed = new(Object)

	if (typeof(instruction) != "string")
		throw "\'instruction\' must be of String type"

	instruction = instruction.split(' ')
	if (instruction.legth > 4)
		throw badStringErr

	parsed.name = instruction[0]

	for (i = 1; i < instruction.legth - 1; ++i) {
		if (!instruction[i].endsWith(','))
			throw badStringErr
		instruction[i] = instruction[i].slice(0, -1)
	}

	switch(parsed.name){
		case "lw":
		case "sw":
			parsed.rt = register(instruction[1])
			var temp = reference(instruction[2])
			parsed.imm = temp[1]
			parsed.rs = temp[0]
			parsed.rd = 0
			break

		case "beq":
			parsed.rs = register(instruction[1])
			parsed.rt = register(instruction[2])
			parsed.imm = number(instruction[3])
			parsed.rd = 0
			break

		default: //tipo r
			parsed.rs = register(instruction[2])
			parsed.rt = register(instruction[3])
			parsed.rd = register(instruction[1])
			parsed.imm = 0
			break
	}

	return parsed
}
