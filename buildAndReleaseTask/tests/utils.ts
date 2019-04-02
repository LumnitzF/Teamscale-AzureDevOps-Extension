import * as utils from '../utils';
import * as assert from 'assert';
import * as path from 'path';

describe('firstWildcardIndex', function() {
    it('should return null if no wildcards present', function() {
        assert.equal(utils.firstWildcardIndex(""), null);
        assert.equal(utils.firstWildcardIndex("test"), null);
    });

    it('should return index of first wildcard if present', function() {
        assert.equal(utils.firstWildcardIndex("test*"), 4);
        assert.equal(utils.firstWildcardIndex("test*?"), 4);
        assert.equal(utils.firstWildcardIndex("test?*"), 4);
        assert.equal(utils.firstWildcardIndex("*test"), 0);
    });
});

const fixturePath = path.join(__dirname, "fixtures");

describe('resolveFiles', function() {
    it('should throw an exception if an absolutely specified file does not exist', function() {
        assert.throws(() => utils.resolveFiles("does/not/exist.xml"), /Not found/);
    });
    
    it('should throw an exception if pattern matches no files', function() {
        assert.throws(() => utils.resolveFiles("does/not/exist*.xml"), /Did not find/);
    });

    it('should return a single file when it exists', function() {
        assert.deepEqual(utils.resolveFiles(`${fixturePath}/coverage.simple`), [`${fixturePath}/coverage.simple`]);
    });

    it('should return all matching files', function() {
        assert.deepEqual(utils.resolveFiles(`${fixturePath}/**.simple`), 
                [`${fixturePath}/coverage.simple`, `${fixturePath}/coverage2.simple`]);
    });
});