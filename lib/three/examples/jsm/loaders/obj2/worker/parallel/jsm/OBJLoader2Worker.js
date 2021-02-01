/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import { OBJLoader2Parser } from "../OBJLoader2Parser.d.ts";
import {
	WorkerRunner,
	DefaultWorkerPayloadHandler
} from "../WorkerRunner.d.ts";

new WorkerRunner( new DefaultWorkerPayloadHandler( new OBJLoader2Parser() ) );
