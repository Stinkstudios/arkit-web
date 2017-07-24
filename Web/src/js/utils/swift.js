export function parseSimdFloat4x4(str) {
  return JSON.parse(
    str.replace(/simd_float4x4\((.+)\)/g, '$1').replace(/\)/g, '')
  );
}

export function parseFloat3(str) {
  return JSON.parse(str.replace(/float3\((.+)\)/g, '[$1]'));
}

export function copyMatrix4Elements(matrix1, matrix2) {
  matrix1.elements[0] = matrix2[0][0];
  matrix1.elements[1] = matrix2[0][1];
  matrix1.elements[2] = matrix2[0][2];
  matrix1.elements[3] = matrix2[0][3];
  matrix1.elements[4] = matrix2[1][0];
  matrix1.elements[5] = matrix2[1][1];
  matrix1.elements[6] = matrix2[1][2];
  matrix1.elements[7] = matrix2[1][3];
  matrix1.elements[8] = matrix2[2][0];
  matrix1.elements[9] = matrix2[2][1];
  matrix1.elements[10] = matrix2[2][2];
  matrix1.elements[11] = matrix2[2][3];
  matrix1.elements[12] = matrix2[3][0];
  matrix1.elements[13] = matrix2[3][1];
  matrix1.elements[14] = matrix2[3][2];
  matrix1.elements[15] = matrix2[3][3];
}
