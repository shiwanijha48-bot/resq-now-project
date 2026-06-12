"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function EmergencyMap({ requests, offers }: any) {

  const redIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const greenIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });


  

  console.log("Requests count:");
  console.log("Offers count:");



  return (
    <MapContainer
      center={[22.9734, 78.6569]}
      zoom={5}
      style={{
        height: "600px",
        width: "100%",
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />


      {/* Red REQUESTS */}
      {requests
        .filter(
          (r: any) =>
            r.latitude !== null &&
            r.longitude !== null &&
            r.latitude !== undefined &&
            r.longitude !== undefined &&
            !isNaN(Number(r.latitude)) &&
            !isNaN(Number(r.longitude))
        )
        .map((r: any, index: number) => (
          <Marker
            key={`req-${r.id}`}
            position={[
              Number(r.latitude) + index * 0.001,
              Number(r.longitude) + index * 0.001,
            ]}
            icon={redIcon}
          >
            <Popup>
              <h3 className="capitalize">{r.category}</h3>
              <p>{r.address || "No address found"}</p>
              <p>{r.description}</p>
            </Popup>
          </Marker>
        ))}



      {/* green OFFERS */}
      {offers
        .filter(
          (o: any) =>
            o.latitude !== null &&
            o.longitude !== null &&
            o.latitude !== undefined &&
            o.longitude !== undefined &&
            !isNaN(Number(o.latitude)) &&
            !isNaN(Number(o.longitude))
        )
        .map((o: any, index: number) => (
          <Marker
            key={`offer-${o.id}`}
            position={[
              Number(o.latitude) + index * 0.001,
              Number(o.longitude) + index * 0.001,
            ]}
            icon={greenIcon}
          >
            <Popup>
              <h3 className="capitalize">{o.category}</h3>
              <p>{o.address || "No address found"}</p>
              <p>{o.description}</p>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}