import PropTypes from 'prop-types';

const templates = [
    { id: 1, src: '/HUL PNG.png', name: 'Standard Template' },
];

function TemplateSelector({ onSelect }) {
    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto p-4">
            <h2 className="text-2xl font-bold text-white mb-6">Select a Template</h2>
            <div className="flex justify-center w-full">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => onSelect(template)}
                        className="cursor-pointer group relative overflow-hidden rounded-xl border-2 border-purple-500/40 hover:border-fuchsia-500 transition-all duration-300 shadow-lg hover:shadow-fuchsia-500/30"
                    >
                        <img
                            src={template.src}
                            alt={template.name}
                            className="w-full max-w-sm h-auto object-contain"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-semibold text-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-2 rounded-full">Tap to Select</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

TemplateSelector.propTypes = {
    onSelect: PropTypes.func.isRequired,
};

export default TemplateSelector;
