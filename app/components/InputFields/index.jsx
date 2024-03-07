export default function Input({type, name}){
    return (
        <div>
            <input className="w-full block p-2 text-slate-500" type={type} name={name} />
        </div>
    );
}