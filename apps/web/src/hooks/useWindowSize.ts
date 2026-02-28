import {useState, useEffect} from "react";

export function useWindowSize() {
    const [size, setSize] = useState<[number, number]>([
        window.innerWidth,
        window.innerHeight,
    ]);
    useEffect(() => {
        const handler = () => setSize([window.innerWidth, window.innerHeight]);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);
    return size;
}