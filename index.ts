/// <reference path="typings/tsd.d.ts" />

import _ = require('lodash');
import {OpCode, VM, Program, optimNumToOpCode} from './vm';

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

var objects = {
	'#1': {
		'foo': new Foo()
	}	
};

let vm = new VM(id => objects[id]);
let r = vm.run(call_foo);
console.log(r);