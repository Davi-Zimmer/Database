import DbFlags from "./DbFlags"

export default interface Node {
    id: number
    classes: string[]
    name?: string
    flags: DbFlags[]
    line: string

}