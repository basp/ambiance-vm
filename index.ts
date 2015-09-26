/// <reference path="typings/tsd.d.ts" />

import _ = require('lodash');

const enum OpCode {
	EQ, NE, GT, LT, GE, LE, IN,
	ADD, MIN, MUL, DIV, MOD,
	POP,
	IMM,
	RET,
	RET0,
	CALL_BI, 
	CALL_VERB,
	NOP,
	SUSPEND,
	EXTENDED,
	OptimNumStart,
	LastOpCode = 255
}

const OptimNumLow = -10;
const OptimNumHi = OpCode.LastOpCode - OpCode.OptimNumStart + OptimNumLow;

function isOptimNumOpCode(o: OpCode): boolean {
	return o >= OpCode.OptimNumStart;
}

function opCodeToOptimNum(o: OpCode): number {
	return o - OpCode.OptimNumStart + OptimNumLow;
}

function optimNumToOpCode(i: number): OpCode {
	return OpCode.OptimNumStart + i - OptimNumLow;
}

function inOptimNumRange(i: number): boolean {
	return i >= OptimNumLow && i <= OptimNumHi;
}

class Program {
	literals: any[];
	main: OpCode[];
}

class Foo extends Program {
	main = [
		OpCode.IMM, 0,
		OpCode.IMM, 1,
		OpCode.CALL_BI,
		OpCode.RET0
	];
	
	literals = [
		'log',
		['hello from foo']			
	];
}

var objects = {
	'#1': {
		'foo': new Foo()
	}	
};

class Frame {
	ip = 0;
	stack = [];
	
	constructor(prog: Program, name?: string, prev?: Frame) {
		this.prog = prog;
		this.prev = prev;
		this.name = name;
	}
	
	name: string;
	prog: Program;
	prev: Frame;
}

var builtin = {
	log: (args) => {
		console.log(args);
		return 0;
	},
	sum: (args) => {
		return _.sum(args);
	}
};

var _in = new Program(); 
_in.main = [
	optimNumToOpCode(2),
	OpCode.IMM,	0,
	OpCode.NOP,
	OpCode.NOP,
	OpCode.NOP,	
	OpCode.IN,
	OpCode.RET
];
_in.literals = [
	'123'
];

var log = new Program();
log.main = [
	OpCode.IMM,	0,
	OpCode.IMM,	1,
	OpCode.CALL_BI,
	OpCode.RET		
];
log.literals = [
	'log',
	['hello world']
];

var sum = new Program();
sum.main = [
	OpCode.IMM,	0,
	OpCode.IMM,	1,
	OpCode.CALL_BI,
	OpCode.RET
];
sum.literals = [
	'sum',
	[1, 2, 3, 4, 5]
];

var eq = new Program();
eq.main = [
	OpCode.IMM,	0,
	OpCode.IMM, 1,
	OpCode.EQ,
	OpCode.RET
];
eq.literals = [
	[1,2,3,4],
	[1,2,3,4]	
];

var call_foo = new Program();
call_foo.main = [
	OpCode.IMM, 0,		
	OpCode.IMM, 1,
	OpCode.CALL_BI, 	// log
	OpCode.POP,
	OpCode.IMM, 2,
	OpCode.IMM, 3,
	OpCode.IMM, 4,
	OpCode.CALL_VERB,	// foo
	OpCode.POP,
	OpCode.IMM, 0,
	OpCode.IMM, 1,
	OpCode.CALL_BI,		// log
	OpCode.POP,
	OpCode.RET0
];
call_foo.literals = [
	'log',
	['hello from call_foo'],
	'#1',
	'foo',
	[]
];

function exec(f: Frame): any {
	var lhs, rhs, ans, args;
	while(true) {
		let op = f.prog.main[f.ip];
		switch(op) {
			case OpCode.NOP:
				break;
			case OpCode.IMM:
				f.ip += 1;
				let slot = f.prog.main[f.ip];
				ans = f.prog.literals[slot];
				f.stack.push(ans);
				break;
			case OpCode.EQ:
				rhs = f.stack.pop();
				lhs = f.stack.pop();
				ans = _.eq(lhs, rhs);
				f.stack.push(ans);
				break;
			case OpCode.NE:
				rhs = f.stack.pop();
				lhs = f.stack.pop();
				ans = !_.eq(lhs, rhs);
				f.stack.push(ans);
				break;
			case OpCode.IN:
				rhs = f.stack.pop();
				lhs = f.stack.pop();
				ans = _.includes(rhs, lhs);
				f.stack.push(ans);
				break;
			case OpCode.POP:
				f.stack.pop();
				break;
			case OpCode.RET:
				ans = f.stack.pop();
				return [ans, false];
			case OpCode.RET0:
				return [0, f.prev];
			case OpCode.CALL_BI:
				args = f.stack.pop();
				let fn = f.stack.pop();
				ans = builtin[fn](args);
				f.stack.push(ans);
				break;
			case OpCode.CALL_VERB:
				f.ip += 1;
				args = f.stack.pop();
				let verb = f.stack.pop();
				let objid = f.stack.pop();
				let cont = new Frame(objects[objid][verb], verb, f);
				return [0, cont];
			default:
				if (isOptimNumOpCode(op)) {
					f.stack.push(opCodeToOptimNum(op));
				}
				else {
					throw new Error(`Invalid OpCode: ${op}`);
				}
		}
		f.ip += 1;
	}
}

function run(p: Program): any {
	let top = new Frame(p, 'MAIN');
	while(top) {
		let [r, cont] = exec(top);
		top = cont;
		if (cont) {
			top.stack.push(r);
		}
		else {
			return r;
		}
	}
	
	throw new Error('No RET/RET0 in program'); 
}

let r = run(call_foo);
console.log(r);