/// <reference path="typings/tsd.d.ts" />

import _ = require('lodash');

const enum OpCode {
	EQ, NE, GT, LT, GE, LE, IN,
	ADD, MIN, MUL, DIV, MOD,
	IMM,
	RET,
	RET0,
	CALL,
	NOP,
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

function run(p: Program): any {
	var lhs, rhs, ans;
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
			case OpCode.CALL:
				rhs = stack.pop();
				lhs = stack.pop();
				ans = builtin[lhs](rhs);
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
	notify: (...args: any[]) => {
		switch(args.length) {
			case 1:	
				console.log(args[0]);
				break;
			default:
				console.log(args);
				break;
		}
		return 0;
	}
};

var _in = new Program(); 
_in.main = [
	optimNumToOpCode(2),
	OpCode.IMM,
	0,
	OpCode.NOP,
	OpCode.NOP,
	OpCode.NOP,	
	OpCode.IN,
	OpCode.RET
];
_in.literals = [
	'123'
];

var call = new Program();
call.main = [
	OpCode.IMM,
	0,
	OpCode.IMM,
	1,
	OpCode.CALL,
	OpCode.RET		
];
call.literals = [
	'notify',
	'hello world'
];

var r = run(call);
console.log(r);