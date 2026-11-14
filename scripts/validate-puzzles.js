import { MODES } from '../src/config.js';
import { puzzlePool } from '../src/data/pools.js';
import { validatePool } from '../src/core/pools.js';
let failed=false;
for(const mode of Object.keys(MODES)){
 const pool=puzzlePool(mode),result=validatePool(pool,mode);
 if(!result.valid){failed=true;for(const error of result.errors)console.error('FAIL',mode,error);}
 else for(const puzzle of pool)console.log('PASS',mode,puzzle.chapter,puzzle.id,puzzle.rating,puzzle.theme);
}
process.exitCode=failed?1:0;
