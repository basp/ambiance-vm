/// <reference path="typings/tsd.d.ts" />

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

class VM {
	objects: (id: string) => any;
	
	constructor(objects: (id: string) => any) {
		this.objects = objects;
	}	
	
	run(p: Program) {
		let top = new Frame(p, 'MAIN');
		while(top) {
			let [r, cont] = this.exec(top);
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
	
	exec(f: Frame) {
		var lhs, rhs, ans, args;
		while(true) {
			let op = f.prog.main[f.ip];
			switch(op) {
				case OpCode.IMM:
					f.ip += 1;
					let slot = f.prog.main[f.ip];
					ans = f.prog.literals[slot];
					f.stack.push(ans);
					break;
				case OpCode.POP:
					f.stack.pop();
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
					let obj = this.objects(objid);
					let cont = new Frame(obj[verb], verb, f);
					return [0, cont];
				case OpCode.NOP:
					break;
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
}

export {
	OpCode, 
	VM, 
	Program, 
	Frame,
	isOptimNumOpCode,
	inOptimNumRange,
	opCodeToOptimNum,
	optimNumToOpCode
}