
const target = () => 42;
const proxy = new Proxy(target, {
    get(t, prop, receiver) {
        if (prop === Symbol.toPrimitive || prop === 'valueOf') {
            return () => t();
        }
        return Reflect.get(t, prop, receiver);
    }
});

console.log("Value:", proxy); // [Function: target]
console.log("Typeof:", typeof proxy); // function
console.log("Math:", proxy + 1); // Should be 43
console.log("String:", `${proxy}`); // Should be "42"
console.log("ValueOf:", proxy); // 42
