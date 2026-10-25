export function convertMBtoGB(mb, isBinary = true) {
    const factor = isBinary ? 1024 : 1000;
    const gb = mb / factor;
    return gb.toFixed(2);
}