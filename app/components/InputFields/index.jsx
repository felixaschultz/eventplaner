export default function Input({type, name}){
    return (
        <div>
            <input className="block p-2 text-slate-500" type={type} name={name} />
        </div>
    );
}