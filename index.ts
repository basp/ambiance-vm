/// <reference path="typings/tsd.d.ts" />

import _ = require('lodash');

const enum OpCode {
	EQ, NE, GT, LT, GE, LE, IN,
	ADD, MIN, MUL, DIV, MOD,
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

const OptimNumLo = -10;
const OptimNumHi = OpCode.LastOpCode - OpCode.OptimNumStart + OptimNumLo;

function isOptimNumOpCode(o: OpCode): boolean {
	return o >= OpCode.OptimNumStart;
}

function opCodeToOptimNum(o: OpCode): number {
	return o - OpCode.OptimNumStart + OptimNumLo;
}

function optimNumToOpCode(i: number): OpCode {
	return OpCode.OptimNumStart + i - OptimNumLo;
}

function inOptimNumRange(i: number): boolean {
	return i >= OptimNumLo && i <= OptimNumHi;
}

class Program {
	literals: any[];
	main: OpCode[];
}

class Frame {
	stack: any[];
	prev: Frame;
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
	
function run(p: Program): any {
	var lhs, rhs, ans, args;
	let stack = [];
	let ip = 0;
	while(true) {
		let op = p.main[ip];
		switch(op) {
			case OpCode.NOP:
				break;
			case OpCode.IMM:
				ip += 1;
				let slot = p.main[ip];
				ans = p.literals[slot];
				stack.push(ans);
				break;
			case OpCode.EQ:
				rhs = stack.pop();
				lhs = stack.pop();
				ans = _.eq(lhs, rhs);
				stack.push(ans);
				break;
			case OpCode.NE:
				rhs = stack.pop();
				lhs = stack.pop();
				ans = !_.eq(lhs, rhs);
				stack.push(ans);
				break;
			case OpCode.IN:
				rhs = stack.pop();
				lhs = stack.pop();
				ans = _.includes(rhs, lhs);
				stack.push(ans);
				break;
			case OpCode.RET:
				return stack.pop();
			case OpCode.RET0:
				return 0;
			case OpCode.CALL_BI:
				args = stack.pop();
				let fn = stack.pop();
				ans = builtin[fn](args);
				stack.push(ans);
				break;
			case OpCode.CALL_VERB:
				args = stack.pop();
				let verb = stack.pop();
				let objid = stack.pop();
				ans = run(objects[objid][verb]);
				stack.push(ans);
				break;
			default:
				if (isOptimNumOpCode(op)) {
					stack.push(opCodeToOptimNum(op));
				}
				else {
					throw new Error(`Invalid OpCode: ${op}`);
				}
		}
		ip += 1;
	}
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
	OpCode.CALL_BI,
	OpCode.IMM, 2,
	OpCode.IMM, 3,
	OpCode.IMM, 4,
	OpCode.CALL_VERB,
	OpCode.RET0	
];
call_foo.literals = [
	'log',
	['hello from call_foo'],
	'#1',
	'foo',
	[]
];

var r = run(call_foo);
console.log(r);