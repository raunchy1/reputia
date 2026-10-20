import { NextResponse } from "next/server";
import { canUseDemoApi } from "@/lib/demo-guard";
export async function GET(){if(!canUseDemoApi())return NextResponse.json({error:"Disabled until auth is implemented"},{status:403});return NextResponse.json({tone:"Cordiale e professionale",mode:"demo"});}
