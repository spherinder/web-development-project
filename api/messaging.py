# with particular thanks to https://maxhalford.github.io/blog/flask-sse-no-deps/
# from which much of the code in this file is derived

import queue


class MessageBroker:
    """
    We use this class to handle sending messages about specific markets. This
    class does not concern itself with the content of the messages; it will
    deliver all messages which are announced to all the currently listening
    clients, who may then do with it what they will.
    """

    def __init__(self):
        self.listeners = {}

    def listen(self, market_id: int):
        q = queue.Queue(maxsize=10)
        if market_id not in self.listeners:
            self.listeners[market_id] = [q]
        else:
            self.listeners[market_id].append(q)
        return q

    @staticmethod
    def format_sse(data: str, event=None) -> str:
        """Formats a string and an event name in order to follow the event stream convention.

        >>> format_sse(data=json.dumps({'abc': 123}), event='Jackson 5')
        'event: Jackson 5\\ndata: {"abc": 123}\\n\\n'

        """
        msg = f"data: {data}\n\n"
        if event is not None:
            msg = f"event: {event}\n{msg}"
        return msg

    def announce(self, msg, market_id):
        formatted = self.format_sse(msg)
        if market_id in self.listeners:
            for i in reversed(range(len(self.listeners[market_id]))):
                try:
                    self.listeners[market_id][i].put_nowait(formatted)
                except queue.Full:
                    del self.listeners[market_id][i]
