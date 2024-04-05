/**
 * Deep merges two or more objects together.
 *
 * @param {...Object} objs - The objects to merge together
 * @returns {Object} - A new object that is the merged result
 */
export function deepMerge(...objs) {

    /**
     * Get the object type
     * @param  {*}       obj The object
     * @return {String}      The object type
     */
    function getType(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    }

    /**
     * Deep merge two objects
     * @return {Object}
     */
    function mergeObj(clone, obj) {
        for (let [key, value] of Object.entries(obj)) {
            let type = getType(value);
            if (clone[key] !== undefined && getType(clone[key]) === type && ['array', 'object'].includes(type)) {
                clone[key] = deepMerge(clone[key], value);
            } else {
                clone[key] = structuredClone(value);
            }
        }
    }

    // Create a clone of the first item in the objs array
    let clone = structuredClone(objs.shift());

    // Loop through each item
    for (let obj of objs) {

        // Get the object type
        let type = getType(obj);

        // If the current item isn't the same type as the clone, replace it
        if (getType(clone) !== type) {
            clone = structuredClone(obj);
            continue;
        }

        // Otherwise, merge
        if (type === 'array') {
            clone = [...clone, ...structuredClone(obj)];
        } else if (type === 'object') {
            mergeObj(clone, obj);
        } else {
            clone = obj;
        }

    }

    return clone;

}
