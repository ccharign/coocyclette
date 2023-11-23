import React from "react";
import NavBar from "../composants/molécules/Navbar";


export default function Base ({ children }: { children: React.ReactNode }) {
    return (

        <div>
            <NavBar />
            {children}
        </div>
    );
}
