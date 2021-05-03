import React, { useState, useRef } from "react";
import GoogleMapReact from "google-map-react";
import useSupercluster from "use-supercluster";
import useSwr from "swr";
import "./css/App.css";

const fetcher = (...args) => fetch(...args).then((response) => response.json());
const Marker = ({ children }) => children;
const urlBocas = "https://data.police.uk/api/crimes-street/all-crime?lat=52.629729&lng=-1.131592&date=2019-10"

const App = () => {
  //Configuraciones para el Map de google
  const [zoom, setZoom] = useState(10);
  const [bounds, setBounds] = useState(null);
  const mapRef = useRef();

  
  //cargar datos y darle el formato
  const { data, error } = useSwr(urlBocas, fetcher);

  //Obtengo los datos de la API y con Slice defino cuantos deseo mostrar
  const places = data && !error ? data.slice(0, 700) : [];
  const points = places.map((place) => ({
    type: "Feature",
    properties: {
      cluster: false,
      crimeId: place.id,
      category: place.category,
    },
    geometry: {
      type: "Point",
      coordinates: [
        parseFloat(place.location.longitude),
        parseFloat(place.location.latitude)
      ],
    },
  }));

  //get Clusters
  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 20 },
  });
  console.log(points);
  return (
    <div style={{ height: "90vh", width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{
          key: "AIzaSyAN7jMQNgb10pOexjJi5cG1SmWWl8w0_E8",
        }}
        defaultCenter={{ lat: 52.6376, lng: -1.135171}}
        defaultZoom={10}
        onChange={({ zoom, bounds }) => {
          setZoom(zoom);
          setBounds([
            bounds.nw.lng,
            bounds.se.lat,
            bounds.se.lng,
            bounds.nw.lat,
          ]);
        }}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({map}) => {
          mapRef.current = map;
        }}
        
      >
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: iscluster } = cluster.properties;

          if (iscluster) {
            return (
              <Marker key={cluster.id} lat={latitude} lng={longitude}>
                <div className="cluster-marker" 
                style={{ width: `${10 + (cluster.properties.point_count / points.length) * 30}px`, height: `${10 + (cluster.properties.point_count / points.length) * 30}px`}}
                onClick={() => {
                  const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(cluster.id), 20)
                  mapRef.current.setZoom(expansionZoom);
                  mapRef.current.panTo({ lat: latitude, lng: longitude})
                }}
                >
                  {cluster.properties.point_count}
                </div>
              </Marker>
            );
          }

          return (
            <Marker
              key={cluster.properties.crimeId}
              lat={latitude}
              lng={longitude}
            >
              <button className="crime-marker">
                <img src="/marker.png" alt="" />
              </button>
            </Marker>
          );
        })}
      </GoogleMapReact>
    </div>
  );
};

export default App;
