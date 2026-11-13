export function marineSurface(T, rows, columns, point) {
 const positions=[],colors=[],indices=[];
 for(let i=0;i<=rows;i++)for(let j=0;j<=columns;j++){
  const [x,y,z,c]=point(i/rows,j/columns);
  positions.push(x,y,z);colors.push(c.r,c.g,c.b);
  if(i<rows&&j<columns){const a=i*(columns+1)+j,b=a+columns+1;indices.push(a,b,a+1,b,b+1,a+1);}
 }
 const g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 g.setAttribute('color',new T.Float32BufferAttribute(colors,3));
 g.setIndex(indices);g.computeVertexNormals();return g;
}
