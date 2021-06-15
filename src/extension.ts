import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

type AbsolutePath = string;  // Absolute path as string, e.g. "/bin/bash"

function logError(msg: string): void {
	console.error(msg)
	vscode.window.showErrorMessage(msg)
}

function getIsoDate(): string {
	const isoDate = new Date().toISOString().substring(0,10);
	return isoDate;
}

function getFileName(): string {
	const isoDate = getIsoDate();
	const fileName = `${isoDate}.md`;
	return fileName;
}

function createPathUnder(dir: AbsolutePath): AbsolutePath {
	const fileName = getFileName();
	const filePath = `${dir}/${fileName}`;
	return filePath;
}

function createPathInSameDirectoryAs(file: AbsolutePath): AbsolutePath {
	const dir = path.dirname(file);
	const filePath = createPathUnder(dir);
	return filePath;
}

class FileAlreadyExistsError extends Error { }

function createFile(filePath: AbsolutePath): void {
	const fileExists = fs.existsSync(filePath);

	if (fileExists) {
		throw new FileAlreadyExistsError(`File ${filePath} exists`);
	}

	const fileContent = "FETCH SNIPPET CONTENT (if available) TO FILL THIS UP";
	fs.appendFileSync(filePath, fileContent);
}

function addFileWithTodaysDate(selectedUri: vscode.Uri): void {
	const selectedPath: AbsolutePath = selectedUri.path;

	const selected = fs.lstatSync(selectedPath);

	let newFilePath: AbsolutePath;
	if (selected.isFile()) {
		newFilePath = createPathInSameDirectoryAs(selectedPath);
	} else if (selected.isDirectory()) {
		newFilePath = createPathUnder(selectedPath);
	} else {
		const msg = `Path ${selectedPath} is not a file or a directory`;
		logError(msg)
		return;
	}

	try {
		createFile(newFilePath);
	} catch (error) {
		if (error instanceof FileAlreadyExistsError) {
			logError(`File ${newFilePath} already exists`);
		} else {
			console.error(error)
		}
	}
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		'markdown-files-with-date.addFileWithTodayDate',
		addFileWithTodaysDate,
	);

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
