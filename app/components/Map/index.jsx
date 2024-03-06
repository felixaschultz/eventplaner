
export default function Map({ place }){
    return (
        <iframe 
            width="100%" 
            height="400" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight="0" 
            marginWidth="0" 
            title={place} 
            src={`https://maps.google.com/maps?q=${place}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
        />
    )
}