import { Body } from 'apollo-angular/http/types'

// ExtractFiles takes the body of the request and returns {clone : Body, files : Map<any, any>}
// The purpose of this function is to transform the query into formData according to Graphql specifications

// I will deal here with the case of a single body, not with an array of bodies

export function extractFiles(body: Body | Body[]) {
    const files = new Map()

    // filter the desired operations if you have distinct download operations with distinct variables

    if (!Array.isArray(body) && body.operationName === 'uploadSingleFile') {
          const value = body.variables?.['file']

          // function that updates the file map value
          updateFiles(value, 'variables.file', files)
    }
    if( Array.isArray( body ) ) body = body[0];
    return {clone: body, files}
}

function updateFiles(value: any, path:string, files: Map<any, any>) {
  if (isExtractable(value)) {
    const filePaths = files.get(value)
    filePaths ? filePaths.push(value) : files.set(value, [path])
  }
}

export function isExtractable(value: any) {
  return (
    (typeof File !== 'undefined' && value instanceof File) ||
    (typeof Blob !== 'undefined' && value instanceof Blob)
  )
}