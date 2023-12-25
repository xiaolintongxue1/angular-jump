import * as vscode from "vscode";

function toCamelCase(input: string): string {
  return input.toLowerCase().replace(/-(.)/g, (match, group1) => {
    return group1.toUpperCase();
  });
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider("html", {
      provideHover(document, position, token) {
        const range = document.getWordRangeAtPosition(position, /<\/?\w+(-\w+)+\b|>/);
        if (range) {
            const word = document.getText(range).replace(/(<\/?)|(\/?>)/, '');;
            const camelCaseText = toCamelCase(word);
            const commandUri = vscode.Uri.parse(
                `command:extension.navigate?${encodeURIComponent(
                    JSON.stringify([camelCaseText])
                )}`
            );
            const hoverMessage = new vscode.MarkdownString(
                `[跳转到定义](${commandUri})`
            );
            hoverMessage.isTrusted = true;
            return new vscode.Hover(hoverMessage);
        }
        return null;
      },
    })
  );

  let disposable = vscode.commands.registerCommand('extension.navigate', async (args) => {
    const files = await vscode.workspace.findFiles(`**/${args}.js`, '**/node_modules/**');
    if (files.length === 1) {
        const document = await vscode.workspace.openTextDocument(files[0]);
        await vscode.window.showTextDocument(document);
    } else if (files.length > 1) {
        const items = files.map(file => ({ label: file.fsPath }));
        const selectedItem = await vscode.window.showQuickPick(items, { placeHolder: 'Select a file' });
        if (selectedItem) {
            const document = await vscode.workspace.openTextDocument(vscode.Uri.file(selectedItem.label));
            await vscode.window.showTextDocument(document);
        }
    }
});

  context.subscriptions.push(disposable);
}

export function deactivate() {}
