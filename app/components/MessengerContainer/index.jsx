import moment from "moment";
import { useEffect, useRef } from "react";
export default function MessageContainer({ messages }){

    const chatRef = useRef();
    useEffect(() => {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, []);

    return (
        <div ref={chatRef} className="messages-container">
            {messages.map((message, i) => {
                // Calculate the difference in seconds between the current message's date and the previous message's date
                const secondsDiff = i > 0 ? moment(message.date).diff(moment(messages[i - 1].date), 'seconds') : 0;
                const you = (message.you) ? " right" : "";
                const lessThan60Seconds = (secondsDiff <= 60) ? " mt-small " : "";
                
                return (
                    <div key={i} style={(message.message.indexOf("iframe") > -1) ? {padding: 0, overflow:"hidden", aspectRatio: "16/9"} : {}} className={"bubble" + you} >
                        {
                            (message.message.indexOf("iframe") > -1 || message.message.indexOf("<a href=") > -1) ? (
                                <div dangerouslySetInnerHTML={{ __html: message.message }} />
                            ) : (
                                message.message
                            )
                        }
                    </div>
                );
            })}
        </div>
    );
}