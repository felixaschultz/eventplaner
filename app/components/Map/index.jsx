
export const loader = async () => {
    return null;
};

export default function Map({ place }){

    return (
        <div className="map-container mt-2">
            <iframe
                title="map"
                width="100%"
                height="300"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://maps.google.com/maps?q=${place}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            ></iframe>
        </div>
    )
}