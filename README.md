# Ambiance VM
The virtual machine part for Ambiance. Very much experimental.

### TODO
* The `IMM` op only supports `Int8` for now. This means we can only
have 255 literals for any given program. It's easy to fix except any program
written that is not padded with the correct amount of `NOP` instructions will
have to be changed. We should support at least `Int32`. 