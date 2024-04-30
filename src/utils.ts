export function csvToJson(data: string){
    const lines = data.split('\n');
    const result: {[key: string]: {[key: string]: string}} = {};
    const headers = (lines[0].split(',')).map((e) => e.slice(1, -1));
    for(let i = 1; i < lines.length; i++){
        const currentline = lines[i].split(',').map((e) => e.slice(1, -1))
        result[currentline[0]] = {}
        for(let j = 1; j < headers.length; j++){
            result[currentline[0]][headers[j]] = currentline[j];
        }
    }
    return result;
}