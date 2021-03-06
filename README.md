Configuración de Google Maps en React
A diferencia de Mapbox, Google Maps administra la mayor parte del estado de nuestro mapa (coordenadas, zoom, etc.), por lo que es un trabajo bastante mínimo poner las cosas en funcionamiento.

Necesitaremos crear una mapRefvariable para almacenar una referencia al mapa en sí. Esto es necesario para llamar a funciones en el mapa, en nuestro caso para posicionar programáticamente el mapa que cubriremos más adelante.

Al desarrollar esto localmente, estoy almacenando mi token de Google Maps en un archivo llamado .env.local, y al nombrarlo con el prefijo REACT_APP_, se cargará en la aplicación automáticamente al crear la aplicación de reacción. Esto se pasa a la bootstrapURLKeyshélice. No se necesitan etiquetas de script adicionales ya que el google-map-reactpaquete maneja este lado de las cosas por nosotros.

El yesIWantToUseGoogleMapApiInternalsque es importante para nosotros tener como onGoogleApiLoadedfunción de devolución de llamada que establece nuestro plano ref exige que sea allí.

exportar aplicación de función predeterminada ( ) {    
  // mapa de configuración
  const mapRef = useRef ( ) ; 

  // cargar y preparar datos
  // obtener los límites del mapa
  // obtener clusters

  // devolver mapa
  retorno ( 
    < div style = { { altura : "100vh" , ancho : "100%" } } >    
      < GoogleMapReact
        bootstrapURLKeys = { { clave : proceso . env . REACT_APP_GOOGLE_KEY } } 
        defaultCenter = { { lat : 52.6376 , lng : - 1,135171 } }   
        defaultZoom = { 10 }
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded = { ( { mapa } ) => {  
          mapRef . actual = mapa ;
        } }
      >
        { / * marcadores aquí * / }
      </ GoogleMapReact >
    </ div >
  ) ;
}
Hacer zoom con clústeres
Preparando datos para supercluster
Es muy probable que los datos de una fuente externa / remota necesiten ser masajeados en el formato requerido por la biblioteca de supercluster. El siguiente ejemplo utiliza SWR para obtener datos remotos mediante ganchos.

Debemos producir una matriz de objetos GeoJSON Feature , siendo la geometría de cada objeto un Punto GeoJSON .

Un ejemplo de los datos se ve así:

[
  {
    "type" : "Característica" , 
    "propiedades" : { 
      "cluster" : falso , 
      "crimeId" : 78212911 , 
      "categoría" : "comportamiento antisocial" 
    } ,
    "geometría" : { "tipo" : "Punto" , "coordenadas" : [ -1.135171 , 52.6376 ] }       
  }
]
Obtener los datos usando SWR y convertirlos al formato adecuado se ve así:

const fetcher = ( ... args ) => buscar ( ... args ) . luego ( respuesta => respuesta . json ( ) ) ;      

exportar aplicación de función predeterminada ( ) {    
  // mapa de configuración

  // cargar y preparar datos
  const url =
    "https://data.police.uk/api/crimes-street/all-crime?lat=52.629729&lng=-1.131592&date=2019-10" ;
  const { datos , error } = useSwr ( url , { fetcher } ) ;    
  const crime = data && ! error ? datos : [ ] ;  
  puntos constantes = delitos . mapa ( crimen => ( {  
    tipo : "Característica" , 
    propiedades : { cluster : false , crimeId : crime . id , categoría : crimen . categoría } ,  
    geometría : { 
      tipo : "Punto" , 
      coordenadas : [ 
        parseFloat ( crimen . ubicación . longitud ) ,
        parseFloat ( crimen . ubicación . latitud )
      ]
    }
  } ) ) ;

  // obtener los límites del mapa
  // obtener clusters
  // devolver mapa
}
Obtener límites del mapa
Para que el supercluster devuelva los clústeres en función de la matriz de puntos que creamos en la sección anterior, debemos proporcionarle dos datos adicionales:

Los límites del mapa: [westLng, southLat, eastLng, northLat]
El zoom del mapa: número entero que representa el nivel de zoom en el que se encuentra nuestro mapa.
Ambos valores se nos proporcionan con un onChangeevento de devolución de llamada que podemos escuchar en el GoogleMapReactcomponente. Dentro de la función de evento, podemos establecer las dos propiedades de estado que configuramos para almacenar esta información.

exportar aplicación de función predeterminada ( ) {    
  // mapa de configuración
  // cargar y preparar datos

  // obtener los límites del mapa
  const [ límites , setBounds ] = useState ( nulo ) ;   
  const [ zoom , setZoom ] = useState ( 10 ) ;   

  // obtener clusters

  // devolver mapa
  retorno ( 
    < div style = { { altura : "100vh" , ancho : "100%" } } >    
      < GoogleMapReact
        onChange = { ( { zoom , límites } ) => {  
          setZoom ( zoom ) ;
          setBounds ( [
            límites . nw . lng ,
            límites . se . lat ,
            límites . se . lng ,
            límites . nw . lat
          ] ) ;
        } }
      >
        { / * marcadores aquí * / }
      </ GoogleMapReact >
    </ div >
  ) ;
}
Obteniendo clústeres del gancho
Con nuestro pointsen el orden correcto y con boundsy zoomaccesible, es hora de recuperar los clústeres. Esto utilizará el useSuperclustergancho proporcionado por el paquete use-supercluster .

Le proporciona a través de un objeto desestructurado una matriz de clústeres y, si lo necesita, la superclustervariable de instancia.

exportar aplicación de función predeterminada ( ) {    
  // mapa de configuración
  // cargar y preparar datos
  // obtener los límites del mapa

  // obtener clusters
  const { clusters , supercluster } = useSupercluster ( {   
    puntos ,
    límites ,
    enfocar ,
    opciones : { radio : 75 , maxZoom : 20 }    
  } ) ;

  // devolver mapa
}
Los clústeres son una matriz de objetos GeoJSON Feature , pero algunos de ellos representan un conjunto de puntos y otros representan puntos individuales que creó anteriormente. Mucho depende de tu nivel de zoom y de cuántos puntos estarían dentro de un radio específico. Cuando el número de puntos se vuelve lo suficientemente pequeño, el supercluster nos da puntos individuales en lugar de grupos. El siguiente ejemplo tiene un grupo (como lo indican las propiedades que contiene) y un punto individual (que en nuestro caso representa un delito).

[
  {
    "type" : "Característica" , 
    "id" : 1461 , 
    "propiedades" : { 
      "cluster" : verdadero , 
      "cluster_id" : 1461 , 
      "cuenta_puntos" : 857 , 
      "point_count_abbreviated" : 857 
    } ,
    "geometría" : { 
      "tipo" : "Punto" , 
      "coordenadas" : [ -1.132138301050194 , 52.63486758501364 ]  
    }
  } ,
  {
    "type" : "Característica" , 
    "propiedades" : { 
      "cluster" : falso , 
      "crimeId" : 78212911 , 
      "categoría" : "comportamiento antisocial" 
    } ,
    "geometría" : { "tipo" : "Punto" , "coordenadas" : [ -1.135171 , 52.6376 ] }       
  }
]
Visualización de clústeres como marcadores
Debido a que la clustersmatriz contiene características que representan un grupo o un punto individual, tenemos que manejar eso mientras los mapeamos. De cualquier manera, ambos tienen coordenadas y podemos usar la clusterpropiedad para determinar cuál es cuál.

El estilo de los grupos depende de usted, tengo algunos estilos simples aplicados a cada uno de los marcadores:

.cluster-marker { 
  color : #fff ;
  fondo : # 1978c8 ;
  radio de borde : 50% ;
  relleno : 10px ;
  pantalla : flex ;
  justificar-contenido : centro ;
  alinear-elementos : centro ;
}

.crime-marker { 
  fondo : ninguno ;
  borde : ninguno ;
}

.crime-marker img { 
  ancho : 25px ;
}
Entonces, como estoy mapeo de los grupos, se cambia el tamaño del clúster con un cálculo basado en la cantidad de puntos del clúster contiene: ${10 + (pointCount / points.length) * 20}px.

const Marker = ( { niños } ) => niños ;    

exportar aplicación de función predeterminada ( ) {    
  // mapa de configuración
  // cargar y preparar datos
  // obtener los límites del mapa
  // obtener clusters

  // devolver mapa
  retorno ( 
    < div style = { { altura : "100vh" , ancho : "100%" } } >    
      < GoogleMapReact >
        { clústeres . mapa ( cluster => {  
          const [ longitud , latitud ] = grupo . geometría . coordenadas ;  
          const { 
            cluster : isCluster ,
            point_count : pointCount
          } = clúster . propiedades ; 

          if ( isCluster ) {  
            retorno ( 
              < Marcador
                clave = { ` cluster- $ { cluster . id } ` }
                lat = { latitud }
                lng = { longitud }
              >
                < div
                  className = " marcador de grupo "
                  estilo = { {
                    anchura : ` $ { 10 + ( PointCount / puntos . longitud ) * 20 } px ` ,     
                    altura : ` $ { 10 + ( PointCount / puntos . de longitud ) * 20 } px `     
                  } }
                  onClick = { ( ) => { } }  
                >
                  { pointCount }
                </ div >
              </ Marcador >
            ) ;
          }

          retorno ( 
            < Marcador
              key = { ` crime- $ { cluster . propiedades . crimeId } ` }
              lat = { latitud }
              lng = { longitud }
            >
              < button className = " crime-marker " > 
                < img src = " /custody.svg " alt = "el crimen no paga " />   
              </ botón >
            </ Marcador >
          ) ;
        } ) }
      </ GoogleMapReact >
    </ div >
  ) ;
}
Transición de zoom animada a un grupo
Siempre podemos hacer zoom en el mapa nosotros mismos como usuario, pero supercluster proporciona una función llamada getClusterExpansionZoom, que cuando se le pasa una ID de clúster, nos devolverá el nivel de zoom al que necesitamos cambiar el mapa para que el clúster se divida en grupos adicionales más pequeños o puntos individuales.

( ) => {  
  const expansionZoom = Math . min (
    supercúmulo . getClusterExpansionZoom ( id . de clúster ) ,
    20
  ) ;
  mapRef . actual . setZoom ( expansionZoom ) ;
  mapRef . actual . panTo ( { lat : latitud , lng : longitud } ) ;
} ;
Pero, ¿dónde vive la función anterior? Se puede pasar al onClickpilar del divque representa un grupo.

Conclusión
Al usar google-map-react, tenemos la capacidad de usar Google Maps dentro de nuestra aplicación React. Al usar, use-superclusterpodemos usar supercluster como un gancho para representar grupos de puntos en nuestro mapa.

Debido a que tenemos acceso a la instancia de supercluster, incluso podemos tomar las "hojas" (los puntos individuales que forman un grupo) a través de la supercluster.getLeaves(cluster.id)función. Con esto podemos mostrar detalles sobre el número x de puntos contenidos dentro de un clúster.
